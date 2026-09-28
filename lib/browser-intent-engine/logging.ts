/**
 * Debug logging for BrowserIntentEngine.
 *
 * Writes, per `resolveIntent()`/`executeAction()` call, exactly what Playwright
 * extracted from the page's DOM, the exact query (state + question + criteria)
 * handed to the decision engine, and the raw decision that came back. This is
 * pure debug/observability tooling for humans improving prompts/extraction --
 * BrowserIntentEngine's control flow never depends on it.
 *
 * Opt-in via `BrowserIntentEngineOptions.logging.enabled`; disabled by default
 * so mock-based/offline tests never touch the filesystem.
 */
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ActionOptions, DecisionAnswer, DecisionPayload, DomCandidate, IntentResolutionResult } from './types.js';

const DEFAULT_LOG_ROOT = 'logs/browser-intent-engine';

// Captured once per process so every resolveIntent() call made during the same
// Playwright run lands in the same run folder (this repo's playwright.config.ts
// pins `workers: 1`, so one process == one test run == one folder).
const PROCESS_RUN_ID = new Date().toISOString().replace(/[:.]/g, '-');

export interface IntentLoggingOptions {
  /** Turns on writing debug logs to disk for every resolveIntent()/executeAction() call. Default false. */
  enabled?: boolean;
  /** Root directory logs are written under. Default "logs/browser-intent-engine". */
  dir?: string;
  /** Subfolder grouping every call from one run together. Default: a timestamp captured at process start. */
  runId?: string;
}

interface ResolutionLogEntry {
  goal: string;
  questionId: string;
  url: string;
  engine: string;
  /** What Playwright extracted from the page's DOM for this resolution pass. */
  candidates: DomCandidate[];
  /** The exact State + Question + Options payload sent to the decision engine. */
  payload: DecisionPayload;
  /** The raw answer returned by the decision engine, or null if it errored/gave none. */
  answer: DecisionAnswer | null;
  resolution: IntentResolutionResult;
}

interface ActionLogEntry {
  goal: string;
  candidateId: string;
  interactionType: string;
  actionOptions: ActionOptions;
  success: boolean;
  error?: string;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '').slice(0, 60) || 'entry';
}

function escapeMd(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

/** Writes one JSON file + one markdown section per resolveIntent()/executeAction() call, under a shared run folder. */
export class IntentRunLogger {
  readonly dir: string;
  private counter = 0;

  constructor(options: Omit<IntentLoggingOptions, 'enabled'> = {}) {
    this.dir = join(options.dir ?? DEFAULT_LOG_ROOT, options.runId ?? PROCESS_RUN_ID);
    mkdirSync(this.dir, { recursive: true });
  }

  logResolution(entry: ResolutionLogEntry): void {
    const seq = ++this.counter;
    const record = { seq, timestamp: new Date().toISOString(), ...entry };
    const filename = `${String(seq).padStart(3, '0')}-${slugify(entry.goal)}.json`;

    writeFileSync(join(this.dir, filename), JSON.stringify(record, null, 2), 'utf8');
    appendFileSync(join(this.dir, 'run.jsonl'), `${JSON.stringify(record)}\n`, 'utf8');
    appendFileSync(join(this.dir, 'run.md'), this.renderResolutionMarkdown(record), 'utf8');
  }

  logAction(entry: ActionLogEntry): void {
    const record = { timestamp: new Date().toISOString(), ...entry };
    appendFileSync(join(this.dir, 'actions.jsonl'), `${JSON.stringify(record)}\n`, 'utf8');

    const lines = [
      `**Executed:** \`${entry.interactionType}\` on \`${entry.candidateId}\` for goal "${entry.goal}" — ` +
        `${entry.success ? 'succeeded' : `FAILED (${entry.error})`}`,
      '',
    ];
    appendFileSync(join(this.dir, 'run.md'), `${lines.join('\n')}\n`, 'utf8');
  }

  private renderResolutionMarkdown(record: ResolutionLogEntry & { seq: number; timestamp: string }): string {
    const lines: string[] = [];
    lines.push(`## ${record.seq}. ${record.goal}`);
    lines.push('');
    lines.push(`- Timestamp: ${record.timestamp}`);
    lines.push(`- URL: \`${record.url}\``);
    lines.push(`- Engine: \`${record.engine}\``);
    lines.push(`- Extracted candidates: ${record.candidates.length}`);
    lines.push('');
    lines.push('### What Playwright extracted from the DOM');
    lines.push('');
    lines.push('| id | tag | text | aria-label | href |');
    lines.push('|---|---|---|---|---|');
    for (const c of record.candidates) {
      lines.push(`| ${c.id} | ${c.tag} | ${escapeMd(c.text)} | ${escapeMd(c.ariaLabel ?? '')} | ${escapeMd(c.href ?? '')} |`);
    }
    lines.push('');
    lines.push('### Exact query sent to the model');
    lines.push('');
    lines.push('```json');
    lines.push(JSON.stringify(record.payload, null, 2));
    lines.push('```');
    lines.push('');
    lines.push('### Raw model decision');
    lines.push('');
    lines.push('```json');
    lines.push(JSON.stringify(record.answer, null, 2));
    lines.push('```');
    lines.push('');
    lines.push(
      `**Resolved:** matched=${record.resolution.matched}, candidateId=${record.resolution.candidateId ?? 'null'}, ` +
        `confidence=${record.resolution.confidence}${record.resolution.reason ? `, reason=${record.resolution.reason}` : ''}`,
    );
    lines.push('');
    lines.push('---');
    lines.push('');
    return lines.join('\n');
  }
}
