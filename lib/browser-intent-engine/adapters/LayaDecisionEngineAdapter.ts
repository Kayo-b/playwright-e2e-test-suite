/**
 * Laya adapter for BrowserIntentEngine.
 *
 * Wraps a Laya `Agent` (or `Router`) behind the framework-agnostic
 * `DecisionEngineAdapter` contract. BrowserIntentEngine never imports `laya-ts`
 * directly -- only this file does -- so swapping in TypeSafe Jev later means
 * writing a sibling adapter, not touching the engine.
 *
 * `laya-ts` ships ESM-only ("type": "module", no CJS build). It is imported
 * dynamically so this file loads cleanly from a CommonJS TypeScript project;
 * a static `import` would fail with ERR_REQUIRE_ESM once transpiled to `require`.
 */
import type { DecisionAnswer, DecisionEngineAdapter, DecisionPayload } from '../types.js';

/** Minimal shape this adapter needs from a Laya `Agent`/`Router` instance. */
export interface LayaRunner {
  predict(
    state: unknown,
    questions: Record<string, { type: string; instructions: unknown; criteria: unknown }>,
  ): Promise<{
    answers: Record<
      string,
      {
        type: string;
        choice?: string;
        confidence: number;
        answer_confidence: number;
        probabilities?: Record<string, number>;
      }
    >;
  }>;
}

export interface LayaDecisionEngineAdapterOptions {
  /**
   * Local checkpoint directory or hub repo id forwarded to `Agent.load`, e.g.
   * "./model" or ("convaiinnovations/laya"). Ignored if `runner` is provided.
   */
  modelPathOrRepo?: string;
  /** Extra options forwarded verbatim to `Agent.load` (device, subfolder, lang_temperatures, ...). */
  loadOptions?: Record<string, unknown>;
  /**
   * Pre-instantiated Laya `Agent`/`Router` (or a test double satisfying `LayaRunner`).
   * Takes priority over `modelPathOrRepo` and skips lazy loading entirely.
   */
  runner?: LayaRunner;
}

export class LayaDecisionEngineAdapter implements DecisionEngineAdapter {
  readonly name = 'laya';

  private readonly options: LayaDecisionEngineAdapterOptions;
  private runnerPromise: Promise<LayaRunner> | null = null;

  constructor(options: LayaDecisionEngineAdapterOptions) {
    if (!options.runner && !options.modelPathOrRepo) {
      throw new Error('LayaDecisionEngineAdapter requires either "runner" or "modelPathOrRepo".');
    }
    this.options = options;
  }

  private async getRunner(): Promise<LayaRunner> {
    if (this.options.runner) return this.options.runner;
    if (!this.runnerPromise) {
      this.runnerPromise = (async () => {
        const { Agent } = await import('laya-ts');
        return Agent.load(this.options.modelPathOrRepo as string, this.options.loadOptions) as unknown as LayaRunner;
      })();
    }
    return this.runnerPromise;
  }

  async decide(payload: DecisionPayload): Promise<Record<string, DecisionAnswer>> {
    const runner = await this.getRunner();
    const result = await runner.predict(payload.state, payload.questions);

    const answers: Record<string, DecisionAnswer> = {};
    for (const questionId of Object.keys(payload.questions)) {
      const raw = result.answers[questionId];
      if (!raw || raw.type !== 'choice' || typeof raw.choice !== 'string') {
        throw new Error(`LayaDecisionEngineAdapter: no valid choice answer returned for question "${questionId}".`);
      }
      answers[questionId] = {
        questionId,
        choice: raw.choice,
        confidence: raw.answer_confidence ?? raw.confidence,
        probabilities: raw.probabilities,
        raw,
      };
    }
    return answers;
  }
}
