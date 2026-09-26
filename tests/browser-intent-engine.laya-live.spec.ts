/**
 * Real, non-mocked integration test: BrowserIntentEngine + LayaDecisionEngineAdapter
 * against a locally running `laya-serve` HTTP server (actual on-device model
 * inference, no hosted API, no mocks).
 *
 * Skips automatically if no server is reachable at LAYA_SERVE_URL, since the
 * server is a separate local process this repo doesn't manage. To start one:
 *
 *   cd <laya repo>
 *   pip install "laya[serve]"
 *   LAYA_MODELS=english laya-serve      # defaults to http://0.0.0.0:8000
 *
 * See lib/browser-intent-engine/IMPLEMENTATION.md for the full setup guide.
 */
import { test, expect } from '@playwright/test';
import { BrowserIntentEngine } from '../lib/browser-intent-engine/BrowserIntentEngine';
import { LayaDecisionEngineAdapter } from '../lib/browser-intent-engine/adapters/LayaDecisionEngineAdapter';

const BASE_URL = process.env.LAYA_SERVE_URL ?? 'http://127.0.0.1:8000';

async function isServerUp(baseUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${baseUrl}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

test.describe('BrowserIntentEngine + real local laya-serve', () => {
  let serverUp = false;

  test.beforeAll(async () => {
    serverUp = await isServerUp(BASE_URL);
  });

  test('resolves and executes a real intent against a live page via local Laya inference', async ({ page }) => {
    test.skip(!serverUp, `No laya-serve instance reachable at ${BASE_URL}; see file header to start one.`);

    await page.setContent(`<!doctype html><html><body>
      <div>
        <button id="submit-btn">Submit Order</button>
        <button id="cancel-btn">Cancel</button>
        <a href="/help">Help</a>
      </div>
    </body></html>`);

    const decisionEngine = new LayaDecisionEngineAdapter({ baseUrl: BASE_URL });
    const engine = new BrowserIntentEngine(page, { decisionEngine });

    const resolution = await engine.resolveIntent('Click the button that completes the purchase');

    expect(resolution.engine).toBe('laya');
    expect(resolution.matched).toBe(true);
    expect(resolution.candidateId).not.toBeNull();
    expect(resolution.candidate?.htmlId).toBe('submit-btn');
    expect(resolution.confidence).toBeGreaterThan(0.5);

    await engine.executeAction(resolution);
    // "Submit Order" has no click handler in this static fixture; executeAction
    // succeeding without throwing confirms the real locator was resolved and clicked.
  });
});
