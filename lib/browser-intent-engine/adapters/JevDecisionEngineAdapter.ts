/**
 * TypeSafe Jev adapter for BrowserIntentEngine.
 *
 * Jev is a **hosted** System 1 API (https://api.typesafe.ai) -- there is no
 * local/on-device mode, unlike Laya. Its wire protocol is what `laya-serve`
 * deliberately mirrors: `POST /v1/systemone` with a
 * `{state, model, questions}` JSON body, `Authorization: Bearer <TYPESAFE_API_KEY>`
 * auth, and a `{model, answers, usage}` response. Those exact details were
 * confirmed by inspecting the published `typesafe-sdk` Python package
 * (`typesafe_sdk._core.constants.SYSTEM_ONE_PATH`, `DEFAULT_BASE_URL`).
 *
 * There is no official TypeScript/JS SDK, so this adapter talks to the API
 * directly over HTTP via the shared `SystemOneHttpAdapter`, rather than
 * wrapping a Python-only client. Requires a real API key from
 * https://console.typesafe.ai to actually call the API, via `JEV_API_KEY`
 * (or the legacy `TYPESAFE_API_KEY` name) in the environment / `.env` file.
 */
import { SystemOneHttpAdapter } from './SystemOneHttpAdapter.js';
import type { DecisionAnswer, DecisionEngineAdapter, DecisionPayload } from '../types.js';

export interface JevDecisionEngineAdapterOptions {
  /** API key from https://console.typesafe.ai. Falls back to the JEV_API_KEY / TYPESAFE_API_KEY env vars. */
  apiKey?: string;
  /** Override the API root (default "https://api.typesafe.ai"; also honors JEV_BASE_URL / TYPESAFE_BASE_URL). */
  baseUrl?: string;
  /** Optional model name/alias forwarded to Jev. Defaults to "jev-latest"; the hosted API requires a non-null model string. */
  model?: string;
  /** Request timeout in milliseconds (default 30000). */
  timeoutMs?: number;
  /** Injectable fetch implementation, mainly for tests. */
  fetchImpl?: typeof fetch;
}

export class JevDecisionEngineAdapter implements DecisionEngineAdapter {
  readonly name = 'jev';

  private readonly delegate: SystemOneHttpAdapter;

  constructor(options: JevDecisionEngineAdapterOptions = {}) {
    const apiKey = options.apiKey ?? process.env.JEV_API_KEY ?? process.env.TYPESAFE_API_KEY;
    if (!apiKey) {
      throw new Error(
        'JevDecisionEngineAdapter requires an API key: pass { apiKey } or set the JEV_API_KEY ' +
          '(or TYPESAFE_API_KEY) environment variable. Get one at https://console.typesafe.ai.',
      );
    }
    this.delegate = new SystemOneHttpAdapter({
      name: this.name,
      baseUrl: options.baseUrl ?? process.env.JEV_BASE_URL ?? process.env.TYPESAFE_BASE_URL ?? 'https://api.typesafe.ai',
      apiKey,
      // Unlike Laya's local server (which auto-routes on a null model), Jev's hosted
      // API requires an explicit model string ("Unknown model: jev" if abbreviated);
      // "jev-latest" always points at Jev's most recent published version.
      model: options.model ?? process.env.JEV_MODEL ?? 'jev-latest',
      timeoutMs: options.timeoutMs,
      fetchImpl: options.fetchImpl,
    });
  }

  async decide(payload: DecisionPayload): Promise<Record<string, DecisionAnswer>> {
    return this.delegate.decide(payload);
  }
}
