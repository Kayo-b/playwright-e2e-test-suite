/**
 * Placeholder adapter for TypeSafe Jev.
 *
 * Jev's public API/SDK is not yet available to this project. This class exists
 * purely to prove out the modular boundary: BrowserIntentEngine depends only on
 * `DecisionEngineAdapter`, so wiring in Jev later is a matter of implementing
 * `decide()` here (or in a Jev-specific SDK wrapper) -- no changes to
 * BrowserIntentEngine, extraction, or action-execution code are required.
 *
 * Replace the body of `decide()` with a real call into Jev once its SDK lands,
 * keeping the same input/output shape.
 */
import type { DecisionAnswer, DecisionEngineAdapter, DecisionPayload } from '../types.js';

export interface JevDecisionEngineAdapterOptions {
  /** e.g. endpoint, model handle, or SDK client -- shape TBD once Jev's API is available. */
  [key: string]: unknown;
}

export class JevDecisionEngineAdapter implements DecisionEngineAdapter {
  readonly name = 'jev';

  constructor(private readonly options: JevDecisionEngineAdapterOptions = {}) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async decide(payload: DecisionPayload): Promise<Record<string, DecisionAnswer>> {
    throw new Error(
      'JevDecisionEngineAdapter.decide() is not implemented yet -- TypeSafe Jev integration is pending. ' +
        'Implement this method against the Jev SDK once available; BrowserIntentEngine requires no changes.',
    );
  }
}
