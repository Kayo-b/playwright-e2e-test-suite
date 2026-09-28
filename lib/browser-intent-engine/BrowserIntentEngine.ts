/**
 * BrowserIntentEngine
 *
 * Sits between a Playwright `Page` and a pluggable, choice-based System 1
 * decision engine (Laya today, TypeSafe Jev tomorrow) to turn semantic goals
 * ("Click the user profile icon") into concrete browser actions.
 *
 * This module is intentionally isolated from any QA/testing framework: it has
 * no knowledge of test runners, assertions, or self-healing test strategies.
 * It only knows how to (1) describe the current page's interactive surface,
 * (2) ask a decision engine which option best satisfies a goal, and
 * (3) execute the corresponding Playwright interaction.
 */
import type { Locator, Page } from 'playwright-core';
import { collectInteractiveElements, type ExtractionParams, type RawCandidate } from './domExtraction.js';
import { IntentRunLogger } from './logging.js';
import type {
  ActionExecutionResult,
  ActionOptions,
  BrowserIntentEngineOptions,
  DomCandidate,
  InteractionType,
  IntentResolutionResult,
} from './types.js';

const DEFAULTS = {
  maxCandidates: 150,
  actionTimeoutMs: 5_000,
  requireVisible: true,
  markerAttribute: 'data-bie-id',
  textMaxLength: 80,
  minConfidence: 0,
} as const;

const DEFAULT_QUESTION_ID = 'intent';

/** Derives how a candidate should be interacted with from its DOM shape. */
function inferInteractionType(raw: RawCandidate): InteractionType {
  if (raw.tag === 'select') return 'selectOption';

  if (raw.tag === 'input') {
    const type = (raw.inputType ?? 'text').toLowerCase();
    if (type === 'checkbox' || type === 'radio') return 'check';
    if (type === 'button' || type === 'submit' || type === 'reset' || type === 'image') return 'click';
    return 'fill';
  }

  if (raw.tag === 'textarea' || raw.contentEditable) return 'fill';

  if (raw.ariaRole === 'checkbox' || raw.ariaRole === 'radio') return 'check';

  if (raw.tag === 'button' || raw.tag === 'a' || raw.ariaRole === 'button' || raw.ariaRole === 'link') return 'click';

  // Default: anything else we bothered to extract (onclick/tabindex heuristics) is click-like.
  return 'click';
}

function toDomCandidate(raw: RawCandidate): DomCandidate {
  return {
    id: raw.id,
    tag: raw.tag,
    interactionType: inferInteractionType(raw),
    text: raw.text,
    ariaLabel: raw.ariaLabel,
    ariaRole: raw.ariaRole,
    name: raw.name,
    placeholder: raw.placeholder,
    href: raw.href,
    htmlId: raw.htmlId,
    className: raw.className,
    inputType: raw.inputType,
    disabled: raw.disabled,
    checked: raw.checked,
  };
}

/** Renders a candidate into a short, model-friendly description string. */
function describeCandidate(candidate: DomCandidate): string {
  const parts: string[] = [`<${candidate.tag}${candidate.inputType ? ` type="${candidate.inputType}"` : ''}>`];
  if (candidate.text) parts.push(`text="${candidate.text}"`);
  if (candidate.ariaLabel) parts.push(`aria-label="${candidate.ariaLabel}"`);
  if (candidate.ariaRole) parts.push(`role="${candidate.ariaRole}"`);
  if (candidate.placeholder) parts.push(`placeholder="${candidate.placeholder}"`);
  if (candidate.name) parts.push(`name="${candidate.name}"`);
  if (candidate.htmlId) parts.push(`id="${candidate.htmlId}"`);
  if (candidate.href) parts.push(`href="${candidate.href}"`);
  if (candidate.checked !== null) parts.push(`checked=${candidate.checked}`);
  if (candidate.disabled) parts.push('disabled');
  return parts.join(' ');
}

export class BrowserIntentEngine {
  private readonly page: Page;
  private readonly options: Required<Omit<BrowserIntentEngineOptions, 'selectors' | 'logging'>> &
    Pick<BrowserIntentEngineOptions, 'selectors'>;
  private readonly logger: IntentRunLogger | null;

  constructor(page: Page, options: BrowserIntentEngineOptions) {
    this.page = page;
    this.options = {
      decisionEngine: options.decisionEngine,
      selectors: options.selectors,
      maxCandidates: options.maxCandidates ?? DEFAULTS.maxCandidates,
      actionTimeoutMs: options.actionTimeoutMs ?? DEFAULTS.actionTimeoutMs,
      requireVisible: options.requireVisible ?? DEFAULTS.requireVisible,
      markerAttribute: options.markerAttribute ?? DEFAULTS.markerAttribute,
      textMaxLength: options.textMaxLength ?? DEFAULTS.textMaxLength,
      minConfidence: options.minConfidence ?? DEFAULTS.minConfidence,
    };
    this.logger = options.logging?.enabled
      ? new IntentRunLogger({ dir: options.logging.dir, runId: options.logging.runId })
      : null;
  }

  /**
   * Scans the current page for interactive elements and returns a clean,
   * structural description of each one. Stamps every match with a marker
   * attribute so it can be re-located later via `executeAction`.
   */
  private async extractCandidates(): Promise<DomCandidate[]> {
    const params: ExtractionParams = {
      markerAttribute: this.options.markerAttribute,
      includeSelectors: this.options.selectors?.include ?? [],
      excludeSelectors: this.options.selectors?.exclude ?? [],
      maxCandidates: this.options.maxCandidates,
      textMaxLength: this.options.textMaxLength,
      requireVisible: this.options.requireVisible,
    };

    const rawCandidates = await this.page.evaluate(collectInteractiveElements, params);
    return rawCandidates.map(toDomCandidate);
  }

  /**
   * Resolves a semantic goal (e.g. "Click the user profile icon") to a
   * specific candidate on the current page by querying the decision engine.
   *
   * Structures the request into the System 1 payload format:
   *   State     = structural DOM snapshot (url + extracted candidates)
   *   Question  = the goal string
   *   Options   = one description per candidate
   */
  async resolveIntent(goal: string, questionId: string = DEFAULT_QUESTION_ID): Promise<IntentResolutionResult> {
    const url = this.page.url();
    const candidates = await this.extractCandidates();

    if (candidates.length === 0) {
      const resolution: IntentResolutionResult = {
        goal,
        matched: false,
        candidateId: null,
        candidate: null,
        confidence: 0,
        engine: this.options.decisionEngine.name,
        reason: 'no-candidates',
      };
      this.logger?.logResolution({
        goal,
        questionId,
        url,
        engine: this.options.decisionEngine.name,
        candidates,
        payload: { state: { url, elements: [] }, questions: {} },
        answer: null,
        resolution,
      });
      return resolution;
    }

    const criteria: Record<string, string> = {};
    for (const candidate of candidates) criteria[candidate.id] = describeCandidate(candidate);

    const state = {
      url,
      elements: candidates.map((candidate) => ({ id: candidate.id, description: criteria[candidate.id] })),
    };

    // The exact query handed to the decision engine: State + Question + Options.
    const payload = {
      state,
      questions: {
        [questionId]: {
          type: 'choice' as const,
          instructions: goal,
          criteria,
        },
      },
    };

    const answers = await this.options.decisionEngine.decide(payload);

    const answer = answers[questionId];
    if (!answer) {
      const resolution: IntentResolutionResult = {
        goal,
        matched: false,
        candidateId: null,
        candidate: null,
        confidence: 0,
        engine: this.options.decisionEngine.name,
        reason: 'engine-error',
      };
      this.logger?.logResolution({
        goal,
        questionId,
        url,
        engine: this.options.decisionEngine.name,
        candidates,
        payload,
        answer: null,
        resolution,
      });
      return resolution;
    }

    const candidate = candidates.find((c) => c.id === answer.choice) ?? null;
    const belowThreshold = answer.confidence < this.options.minConfidence;

    const resolution: IntentResolutionResult = {
      goal,
      matched: candidate !== null && !belowThreshold,
      candidateId: candidate ? answer.choice : null,
      candidate,
      confidence: answer.confidence,
      probabilities: answer.probabilities,
      engine: this.options.decisionEngine.name,
      reason: candidate === null ? 'unknown-choice' : belowThreshold ? 'below-min-confidence' : undefined,
      raw: answer.raw,
    };

    this.logger?.logResolution({ goal, questionId, url, engine: this.options.decisionEngine.name, candidates, payload, answer, resolution });
    return resolution;
  }

  /** Re-locates the live element a resolution points at, via its marker attribute. */
  private locatorFor(candidateId: string): Locator {
    return this.page.locator(`[${this.options.markerAttribute}="${candidateId}"]`);
  }

  /**
   * Executes the interaction implied by a resolved intent: resolves the
   * candidate back to a live Playwright locator, picks the right interaction
   * (.click() for buttons/links, .fill() for text inputs, .check()/.selectOption()
   * where applicable), and runs it.
   */
  async executeAction(resolution: IntentResolutionResult, actionOptions: ActionOptions = {}): Promise<ActionExecutionResult> {
    if (!resolution.matched || !resolution.candidateId || !resolution.candidate) {
      throw new Error(
        `BrowserIntentEngine.executeAction: cannot execute unresolved intent "${resolution.goal}"` +
          (resolution.reason ? ` (reason: ${resolution.reason})` : ''),
      );
    }

    const { candidateId, candidate } = resolution;
    const timeout = actionOptions.timeoutMs ?? this.options.actionTimeoutMs;
    const locator = this.locatorFor(candidateId);

    try {
      switch (candidate.interactionType) {
        case 'fill': {
          if (actionOptions.value === undefined) {
            throw new Error(`BrowserIntentEngine.executeAction: candidate "${candidateId}" requires "value" to fill.`);
          }
          await locator.fill(actionOptions.value, { timeout });
          break;
        }
        case 'selectOption': {
          if (actionOptions.value === undefined) {
            throw new Error(`BrowserIntentEngine.executeAction: candidate "${candidateId}" requires "value" to select.`);
          }
          await locator.selectOption(actionOptions.value, { timeout });
          break;
        }
        case 'check': {
          const desiredChecked = actionOptions.checked ?? true;
          if (desiredChecked) await locator.check({ timeout });
          else await locator.uncheck({ timeout });
          break;
        }
        case 'click':
        case 'unknown':
        default: {
          await locator.click({ timeout });
          break;
        }
      }
    } catch (err) {
      this.logger?.logAction({
        goal: resolution.goal,
        candidateId,
        interactionType: candidate.interactionType,
        actionOptions,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }

    this.logger?.logAction({
      goal: resolution.goal,
      candidateId,
      interactionType: candidate.interactionType,
      actionOptions,
      success: true,
    });

    // Best-effort hygiene: don't leave marker attributes behind on the live page.
    await locator.evaluate((el, attr) => el.removeAttribute(attr), this.options.markerAttribute).catch(() => undefined);

    return { candidateId, interactionType: candidate.interactionType, success: true };
  }
}
