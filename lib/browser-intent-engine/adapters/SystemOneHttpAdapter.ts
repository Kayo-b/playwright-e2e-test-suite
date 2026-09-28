/**
 * Generic HTTP client for the "System 1" `/v1/systemone` wire protocol.
 *
 * This one protocol is shared by two otherwise-unrelated engines:
 *  - A local `laya-serve` process (Laya, running entirely on-device -- see
 *    https://huggingface.co/convaiinnovations/laya, `laya/serve.py`'s
 *    `create_app()`), which exposes `POST /v1/systemone` deliberately shaped
 *    to match TypeSafe Jev's wire protocol.
 *  - TypeSafe Jev's hosted API (`https://api.typesafe.ai`, see the published
 *    `typesafe-sdk` Python package), which exposes the same `POST /v1/systemone`
 *    path, the same `{state, model, questions}` request body, the same
 *    `Authorization: Bearer <token>` auth, and the same
 *    `{model, answers, usage}` response shape.
 *
 * Because the wire protocol is identical, BrowserIntentEngine only needs one
 * HTTP client implementation. `LayaDecisionEngineAdapter` and
 * `JevDecisionEngineAdapter` are thin presets over this class that just point
 * it at a different `baseUrl`/auth scheme -- see those files for details.
 *
 * This adapter never imports Playwright, a test runner, or a specific model
 * SDK; it only speaks plain HTTP/JSON via the platform `fetch`.
 */
import type { DecisionAnswer, DecisionEngineAdapter, DecisionPayload } from '../types.js';

/** A single answer as returned by the `/v1/systemone` wire protocol. */
interface WireChoiceAnswer {
  type: string;
  choice?: string;
  /** Laya's own field name for "probability mass on the reported choice". */
  answer_confidence?: number;
  /** Generic confidence field used by both Laya and Jev. */
  confidence?: number;
  probabilities?: Record<string, number>;
  [key: string]: unknown;
}

interface WireSystemOneResponse {
  model?: string;
  answers: Record<string, WireChoiceAnswer>;
  usage?: { input_tokens?: number | null; output_tokens?: number | null };
  [key: string]: unknown;
}

export interface SystemOneHttpAdapterOptions {
  /** Root of the server, e.g. "http://127.0.0.1:8000" or "https://api.typesafe.ai" (no trailing slash needed). */
  baseUrl: string;
  /** Sent as "Authorization: Bearer <apiKey>" when set. Required by hosted Jev; optional for a local laya-serve. */
  apiKey?: string;
  /**
   * Optional model name/alias forwarded in the request body (e.g. "english",
   * "convaiinnovations/laya", or a Jev-published model id). Omit to let the
   * server auto-route/use its own default.
   */
  model?: string;
  /** Identifier surfaced via `DecisionEngineAdapter.name` for logging. */
  name: string;
  /** Request timeout in milliseconds (default 30000). */
  timeoutMs?: number;
  /** Extra headers merged into every request. */
  headers?: Record<string, string>;
  /** Injectable fetch implementation, mainly for tests. Defaults to the global `fetch`. */
  fetchImpl?: typeof fetch;
}

export class SystemOneHttpAdapter implements DecisionEngineAdapter {
  readonly name: string;

  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly model?: string;
  private readonly timeoutMs: number;
  private readonly headers: Record<string, string>;
  private readonly fetchImpl: typeof fetch;

  constructor(options: SystemOneHttpAdapterOptions) {
    if (!options.baseUrl) {
      throw new Error('SystemOneHttpAdapter requires a non-empty "baseUrl".');
    }
    this.name = options.name;
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.apiKey = options.apiKey;
    this.model = options.model;
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.headers = options.headers ?? {};
    const impl = options.fetchImpl ?? globalThis.fetch;
    if (!impl) {
      throw new Error(
        'SystemOneHttpAdapter: no "fetch" implementation available. Pass "fetchImpl" explicitly on Node < 18.',
      );
    }
    this.fetchImpl = impl;
  }

  async decide(payload: DecisionPayload): Promise<Record<string, DecisionAnswer>> {
    const body = JSON.stringify({
      state: payload.state,
      model: this.model ?? null,
      questions: payload.questions,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}/v1/systemone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
          ...this.headers,
        },
        body,
        signal: controller.signal,
      });
    } catch (err) {
      const cause = err instanceof Error ? err.message : String(err);
      throw new Error(
        `${this.name}: failed to reach "${this.baseUrl}/v1/systemone" (${cause}). ` +
          `If this is meant to be a local Laya server, confirm it is running (e.g. "laya-serve").`,
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`${this.name}: request to "${this.baseUrl}/v1/systemone" failed (${response.status}): ${text}`);
    }

    const result = (await response.json()) as WireSystemOneResponse;

    const answers: Record<string, DecisionAnswer> = {};
    for (const questionId of Object.keys(payload.questions)) {
      const raw = result.answers?.[questionId];
      if (!raw || raw.type !== 'choice' || typeof raw.choice !== 'string') {
        throw new Error(`${this.name}: no valid choice answer returned for question "${questionId}".`);
      }
      answers[questionId] = {
        questionId,
        choice: raw.choice,
        confidence: raw.answer_confidence ?? raw.confidence ?? 0,
        probabilities: raw.probabilities,
        raw,
      };
    }
    return answers;
  }
}
