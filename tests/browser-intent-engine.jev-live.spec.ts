/**
 * Real, non-mocked integration test: BrowserIntentEngine + JevDecisionEngineAdapter
 * against TypeSafe Jev's hosted API (https://api.typesafe.ai) AND a real,
 * publicly hosted web page (no static HTML fixtures), so we can compare how
 * well Jev performs at picking the right element out of a full production
 * DOM against the same intents used in the Laya live suite.
 *
 * Target site: https://balacobacoberlin.web.app/blcbco (a live bakery
 * storefront, unaffiliated with this repo -- used purely as a realistic,
 * complex DOM to exercise intent resolution against).
 *
 * Requires a real API key from https://console.typesafe.ai, set as
 * JEV_API_KEY in the environment or a repo-root `.env` file (also accepts
 * the legacy TYPESAFE_API_KEY name; see playwright.config.ts, which loads
 * `.env` via `process.loadEnvFile()`). Skips automatically, with a clear
 * message, if neither is set -- this suite calls a real hosted API and will
 * incur usage against your account when it runs.
 *
 * Debug logging: every `resolveIntent()`/`executeAction()` call below writes a
 * full record -- what Playwright extracted from the DOM, the exact query sent
 * to Jev, and its raw decision -- to `logs/browser-intent-engine/<run>/`
 * (gitignored). See that folder after a run to inspect/improve prompts.
 */
import { test, expect } from '@playwright/test';
import { BrowserIntentEngine } from '../lib/browser-intent-engine/BrowserIntentEngine';
import { JevDecisionEngineAdapter } from '../lib/browser-intent-engine/adapters/JevDecisionEngineAdapter';
import type { BrowserIntentEngineOptions } from '../lib/browser-intent-engine/types';

const TARGET_URL = process.env.LIVE_TARGET_URL ?? 'https://balacobacoberlin.web.app/blcbco';
const logging: BrowserIntentEngineOptions['logging'] = { enabled: true };

const apiKey = process.env.JEV_API_KEY ?? process.env.TYPESAFE_API_KEY;

test.describe('BrowserIntentEngine + real Jev hosted API, against a real live page', () => {
  test.beforeEach(() => {
    test.skip(!apiKey, 'No JEV_API_KEY (or TYPESAFE_API_KEY) configured; see file header to set one up.');
  });

  test('navigates to the shop page via the homepage nav bar', async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

    const decisionEngine = new JevDecisionEngineAdapter({ apiKey });
    const engine = new BrowserIntentEngine(page, { decisionEngine, logging });

    const resolution = await engine.resolveIntent('Go to the shop to browse the bakery products for sale');

    expect(resolution.engine).toBe('jev');
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

    const decisionEngine = new JevDecisionEngineAdapter({ apiKey });
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

    const decisionEngine = new JevDecisionEngineAdapter({ apiKey });
    const engine = new BrowserIntentEngine(page, { decisionEngine, logging });

    const resolution = await engine.resolveIntent('Show me the details for the Bolo Gelado cake');

    expect(resolution.matched).toBe(true);
    expect(resolution.candidate?.href).toBe('/blcbco/product/1');
    expect(resolution.confidence).toBeGreaterThan(0.5);

    await engine.executeAction(resolution);
    await expect(page).toHaveURL(/\/product\/1$/);
  });
});
