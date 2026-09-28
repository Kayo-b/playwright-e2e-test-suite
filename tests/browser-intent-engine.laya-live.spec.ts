/**
 * Real, non-mocked integration test: BrowserIntentEngine + LayaDecisionEngineAdapter
 * against a locally running `laya-serve` HTTP server (actual on-device model
 * inference, no hosted API, no mocks) AND a real, publicly hosted web page
 * (no static HTML fixtures), so we can see how well Laya actually performs at
 * picking the right element out of a full production DOM.
 *
 * Target site: https://balacobacoberlin.web.app/blcbco (a live bakery
 * storefront, unaffiliated with this repo -- used purely as a realistic,
 * complex DOM to exercise intent resolution against).
 *
 * Skips automatically if no server is reachable at LAYA_SERVE_URL, since the
 * server is a separate local process this repo doesn't manage. To start one:
 *
 *   cd <laya repo>
 *   pip install "laya[serve]"
 *   LAYA_MODELS=english laya-serve      # defaults to http://0.0.0.0:8000
 *
 * See lib/browser-intent-engine/IMPLEMENTATION.md for the full setup guide.
 *
 * Debug logging: every `resolveIntent()`/`executeAction()` call below writes a
 * full record -- what Playwright extracted from the DOM, the exact query sent
 * to Laya, and its raw decision -- to `logs/browser-intent-engine/<run>/`
 * (gitignored). See that folder after a run to inspect/improve prompts.
 */
import { test, expect } from '@playwright/test';
import { BrowserIntentEngine } from '../lib/browser-intent-engine/BrowserIntentEngine';
import { LayaDecisionEngineAdapter } from '../lib/browser-intent-engine/adapters/LayaDecisionEngineAdapter';
import type { BrowserIntentEngineOptions } from '../lib/browser-intent-engine/types';

const BASE_URL = process.env.LAYA_SERVE_URL ?? 'http://127.0.0.1:8000';
const TARGET_URL = process.env.LIVE_TARGET_URL ?? 'https://balacobacoberlin.web.app/blcbco';
const logging: BrowserIntentEngineOptions['logging'] = { enabled: true };

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

test.describe('BrowserIntentEngine + real local laya-serve, against a real live page', () => {
  let serverUp = false;

  test.beforeAll(async () => {
    serverUp = await isServerUp(BASE_URL);
  });

  test.beforeEach(() => {
    test.skip(!serverUp, `No laya-serve instance reachable at ${BASE_URL}; see file header to start one.`);
  });

  test('navigates to the shop page via the homepage nav bar', async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

    const decisionEngine = new LayaDecisionEngineAdapter({ baseUrl: BASE_URL });
    const engine = new BrowserIntentEngine(page, { decisionEngine, logging });

    const resolution = await engine.resolveIntent('Go to the shop to browse the bakery products for sale');

    expect(resolution.engine).toBe('laya');
    expect(resolution.matched).toBe(true);
    expect(resolution.candidate?.interactionType).toBe('click');
    expect(resolution.candidate?.href).toContain('/products');

    await engine.executeAction(resolution);
    await expect(page).toHaveURL(/\/products$/);
  });

  test('opens the shopping cart drawer from the header icon', async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

    // The cart drawer is always present in the DOM (translated off-screen via a
    // `translate-x-full` class when closed), so we assert on its actual on-screen
    // position rather than DOM presence/text, which would be a false positive.
    const drawer = page.locator('div.fixed.right-0.top-0.h-full');
    await expect(drawer).not.toBeInViewport();

    const decisionEngine = new LayaDecisionEngineAdapter({ baseUrl: BASE_URL });
    const engine = new BrowserIntentEngine(page, { decisionEngine, logging });

    const resolution = await engine.resolveIntent('Open my shopping cart so I can see what I have added');

    expect(resolution.matched).toBe(true);
    expect(resolution.candidate?.interactionType).toBe('click');
    expect(resolution.candidate?.className).toContain('cart-btn');

    await engine.executeAction(resolution);
    await expect(drawer).toBeInViewport();
  });

  test('opens a specific product detail page from the shop grid', async ({ page }) => {
    await page.goto(`${TARGET_URL}/products`, { waitUntil: 'networkidle' });

    const decisionEngine = new LayaDecisionEngineAdapter({ baseUrl: BASE_URL });
    const engine = new BrowserIntentEngine(page, { decisionEngine, logging });

    const resolution = await engine.resolveIntent('Show me the details for the Bolo Gelado cake');

    expect(resolution.matched).toBe(true);
    expect(resolution.candidate?.href).toBe('/blcbco/product/1');
    expect(resolution.confidence).toBeGreaterThan(0.5);

    await engine.executeAction(resolution);
    await expect(page).toHaveURL(/\/product\/1$/);
  });
});
