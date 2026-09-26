/**
 * Shared type contracts for BrowserIntentEngine.
 *
 * These types have zero dependency on Playwright's test runner, any QA framework,
 * or any specific decision-engine implementation (Laya, Jev, or otherwise). They
 * describe the boundary between "what the DOM looks like" and "what a System 1
 * choice-based model needs to pick an option".
 */

/** How a resolved candidate should be interacted with once chosen. */
export type InteractionType = 'click' | 'fill' | 'check' | 'selectOption' | 'unknown';

/** A single interactive element extracted from the live page. */
export interface DomCandidate {
  /** Stable id assigned for this extraction pass; used to re-locate the live element. */
  id: string;
  /** Lower-cased tag name, e.g. "button", "a", "input". */
  tag: string;
  /** Interaction inferred from tag/type/contenteditable, used by executeAction. */
  interactionType: InteractionType;
  /** Trimmed, whitespace-collapsed visible text (truncated to textMaxLength). */
  text: string;
  ariaLabel: string | null;
  ariaRole: string | null;
  name: string | null;
  placeholder: string | null;
  href: string | null;
  htmlId: string | null;
  className: string | null;
  /** input[type] when applicable (text, email, checkbox, radio, ...). */
  inputType: string | null;
  disabled: boolean;
  /** checkbox/radio checked state, null when not applicable. */
  checked: boolean | null;
}

/** A single choice-style question in the System 1 payload format. */
export interface DecisionChoiceQuestion {
  type: 'choice';
  /** The semantic goal / natural-language question, e.g. "Click the user profile icon". */
  instructions: string;
  /** candidateId -> human-readable description of that option. */
  criteria: Record<string, string>;
}

/** The full payload handed to a decision engine: State + Question(s) + Options. */
export interface DecisionPayload {
  /** Arbitrary structural snapshot of the page (State). Serialized by the engine adapter. */
  state: unknown;
  /** One or more named questions to answer against that state in a single call (Question + Options). */
  questions: Record<string, DecisionChoiceQuestion>;
}

/** The decision engine's answer to a single question. */
export interface DecisionAnswer {
  questionId: string;
  /** The winning candidateId (matches a key in that question's `criteria`). */
  choice: string;
  /** 0..1 confidence in the chosen answer. */
  confidence: number;
  /** Optional full probability distribution over all options, when the engine exposes it. */
  probabilities?: Record<string, number>;
  /** Escape hatch for engine-specific diagnostics; never consumed by BrowserIntentEngine directly. */
  raw?: unknown;
}

/**
 * The sole contract BrowserIntentEngine depends on. Any choice-based System 1 engine
 * (Laya today, TypeSafe Jev tomorrow, or a hand-rolled heuristic) can implement this
 * to be plugged in without touching BrowserIntentEngine itself.
 */
export interface DecisionEngineAdapter {
  /** Short identifier surfaced in resolution results for logging/debugging, e.g. "laya". */
  readonly name: string;
  /** Answer every question in the payload against the given state in one call. */
  decide(payload: DecisionPayload): Promise<Record<string, DecisionAnswer>>;
}

/** Result of resolving a semantic goal against the current page. */
export interface IntentResolutionResult {
  goal: string;
  matched: boolean;
  candidateId: string | null;
  candidate: DomCandidate | null;
  confidence: number;
  probabilities?: Record<string, number>;
  /** Name of the decision engine that produced this resolution. */
  engine: string;
  /** Reason matched is false, e.g. "no-candidates" | "below-min-confidence" | "engine-error". */
  reason?: string;
  raw?: unknown;
}

/** Extra input required by fill/check/selectOption interactions. */
export interface ActionOptions {
  /** Text to type (fill), option value/label to select (selectOption). */
  value?: string;
  /** Desired checked state for check/uncheck; defaults to true. */
  checked?: boolean;
  /** Overrides the engine-level default action timeout for this call only. */
  timeoutMs?: number;
}

export interface ActionExecutionResult {
  candidateId: string;
  interactionType: InteractionType;
  success: true;
}

export interface SelectorFilters {
  /** CSS selectors to scan in addition to (or instead of) the built-in interactive set. */
  include?: string[];
  /** CSS selectors to always exclude, e.g. ["[data-testid=ad-banner]"]. */
  exclude?: string[];
}

export interface BrowserIntentEngineOptions {
  /** The pluggable System 1 decision engine (LayaDecisionEngineAdapter, JevDecisionEngineAdapter, ...). */
  decisionEngine: DecisionEngineAdapter;
  selectors?: SelectorFilters;
  /** Caps the number of extracted candidates per resolution (default 150). */
  maxCandidates?: number;
  /** Default timeout (ms) applied to Playwright actions in executeAction (default 5000). */
  actionTimeoutMs?: number;
  /** Only consider elements that are actually visible in the viewport (default true). */
  requireVisible?: boolean;
  /** DOM attribute used to mark/re-locate extracted candidates (default "data-bie-id"). */
  markerAttribute?: string;
  /** Max characters of visible text captured per candidate (default 80). */
  textMaxLength?: number;
  /** Resolutions below this confidence are reported as unmatched (default 0, i.e. disabled). */
  minConfidence?: number;
}
