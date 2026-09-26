/**
 * Laya adapter for BrowserIntentEngine.
 *
 * Talks to a **local Laya server** (`laya-serve`, from the `laya[serve]` Python
 * package -- see https://huggingface.co/convaiinnovations/laya) over plain HTTP.
 * Inference runs entirely on-device in that separate process; this adapter is
 * just an HTTP client, so BrowserIntentEngine never links against a model
 * runtime, ONNX, or any Python package directly.
 *
 * Start the server once, separately from your Playwright process, e.g.:
 *
 *   pip install "laya[serve]"
 *   laya-serve                 # defaults to http://0.0.0.0:8000
 *
 * or with explicit configuration:
 *
 *   LAYA_MODELS=english LAYA_HOST=127.0.0.1 LAYA_PORT=8000 laya-serve
 *
 * See `lib/browser-intent-engine/IMPLEMENTATION.md` for the full setup guide.
 *
 * `laya-serve`'s `POST /v1/systemone` route is deliberately wire-compatible
 * with TypeSafe Jev's hosted API, so this class is a thin preset over the
 * shared `SystemOneHttpAdapter` -- see that file for the actual HTTP logic.
 */
import { SystemOneHttpAdapter } from './SystemOneHttpAdapter.js';
import type { DecisionAnswer, DecisionEngineAdapter, DecisionPayload } from '../types.js';

export interface LayaDecisionEngineAdapterOptions {
  /** Root of the running laya-serve instance (default "http://127.0.0.1:8000"). */
  baseUrl?: string;
  /** Bearer token, only needed if the server was started with LAYA_API_KEY set. */
  apiKey?: string;
  /** Optional model name/alias ("english" | "multilingual" | "typed-decisions" | a repo id). Omit to auto-route. */
  model?: string;
  /** Request timeout in milliseconds (default 30000; local inference is normally well under 2s once warm). */
  timeoutMs?: number;
  /** Injectable fetch implementation, mainly for tests. */
  fetchImpl?: typeof fetch;
}

export class LayaDecisionEngineAdapter implements DecisionEngineAdapter {
  readonly name = 'laya';

  private readonly delegate: SystemOneHttpAdapter;

  constructor(options: LayaDecisionEngineAdapterOptions = {}) {
    this.delegate = new SystemOneHttpAdapter({
      name: this.name,
      baseUrl: options.baseUrl ?? 'http://127.0.0.1:8000',
      apiKey: options.apiKey,
      model: options.model,
      timeoutMs: options.timeoutMs,
      fetchImpl: options.fetchImpl,
    });
  }

  async decide(payload: DecisionPayload): Promise<Record<string, DecisionAnswer>> {
    return this.delegate.decide(payload);
  }
}
