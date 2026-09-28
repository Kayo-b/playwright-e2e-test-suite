/**
 * Regression tests for the BrowserIntentEngine module (lib/browser-intent-engine).
 *
 * These use an in-memory mock DecisionEngineAdapter instead of a real Laya/Jev
 * model, so they run fully offline and deterministically -- they verify DOM
 * extraction, resolution wiring, and action execution, not model accuracy.
 */
import { test, expect } from '@playwright/test';
import { BrowserIntentEngine } from '../lib/browser-intent-engine/BrowserIntentEngine';
import type { DecisionAnswer, DecisionEngineAdapter, DecisionPayload } from '../lib/browser-intent-engine/types';

const HTML = `<!doctype html><html><body>
  <nav>
    <a href="/home" aria-label="Home link">Home</a>
    <button id="profile-btn" aria-label="User profile icon">avatar</button>
  </nav>
  <form>
    <input type="text" name="username" placeholder="Enter your username" />
    <input type="checkbox" name="remember" /> Remember me
    <select name="country"><option value="us">US</option><option value="fr">France</option></select>
    <button type="submit">Submit</button>
  </form>
</body></html>`;

/** Deterministic test double for DecisionEngineAdapter: picker chooses the winning candidateId. */
class MockEngine implements DecisionEngineAdapter {
  readonly name = 'mock';
  constructor(private readonly pick: (payload: DecisionPayload, questionId: string) => string) {}
  async decide(payload: DecisionPayload): Promise<Record<string, DecisionAnswer>> {
    const out: Record<string, DecisionAnswer> = {};
    for (const questionId of Object.keys(payload.questions)) {
      const choice = this.pick(payload, questionId);
      out[questionId] = { questionId, choice, confidence: 0.97 };
    }
    return out;
  }
}

test('resolves click intent and executes it', async ({ page }) => {
  await page.setContent(HTML);
  const mock = new MockEngine((payload) => {
    const entries = Object.entries(payload.questions['intent'].criteria);
    const found = entries.find(([, desc]) => desc.includes('User profile icon'));
    expect(found).toBeTruthy();
    return found![0];
  });
  const engine = new BrowserIntentEngine(page, { decisionEngine: mock });
  const resolution = await engine.resolveIntent('Click the user profile icon');
  expect(resolution.matched).toBe(true);
  expect(resolution.candidate?.interactionType).toBe('click');
  await engine.executeAction(resolution);
});

test('resolves fill intent and executes it', async ({ page }) => {
  await page.setContent(HTML);
  const mock = new MockEngine((payload) => {
    const entries = Object.entries(payload.questions['intent'].criteria);
    const found = entries.find(([, desc]) => desc.includes('Enter your username'));
    expect(found).toBeTruthy();
    return found![0];
  });
  const engine = new BrowserIntentEngine(page, { decisionEngine: mock });
  const resolution = await engine.resolveIntent('Type the username');
  expect(resolution.candidate?.interactionType).toBe('fill');
  await engine.executeAction(resolution, { value: 'octocat' });
  await expect(page.locator('input[name="username"]')).toHaveValue('octocat');
});

test('resolves check intent and executes it', async ({ page }) => {
  await page.setContent(HTML);
  const mock = new MockEngine((payload) => {
    const entries = Object.entries(payload.questions['intent'].criteria);
    const found = entries.find(([, desc]) => desc.startsWith('<input type="checkbox">'));
    expect(found).toBeTruthy();
    return found![0];
  });
  const engine = new BrowserIntentEngine(page, { decisionEngine: mock });
  const resolution = await engine.resolveIntent('Check remember me');
  expect(resolution.candidate?.interactionType).toBe('check');
  await engine.executeAction(resolution);
  await expect(page.locator('input[name="remember"]')).toBeChecked();
});

test('resolves selectOption intent and executes it', async ({ page }) => {
  await page.setContent(HTML);
  const mock = new MockEngine((payload) => {
    const entries = Object.entries(payload.questions['intent'].criteria);
    const found = entries.find(([, desc]) => desc.startsWith('<select>'));
    expect(found).toBeTruthy();
    return found![0];
  });
  const engine = new BrowserIntentEngine(page, { decisionEngine: mock });
  const resolution = await engine.resolveIntent('Choose the country');
  expect(resolution.candidate?.interactionType).toBe('selectOption');
  await engine.executeAction(resolution, { value: 'fr' });
  await expect(page.locator('select[name="country"]')).toHaveValue('fr');
});

test('cleans up the marker on the executed candidate', async ({ page }) => {
  await page.setContent(HTML);
  const mock = new MockEngine((payload) => Object.keys(payload.questions['intent'].criteria)[0]);
  const engine = new BrowserIntentEngine(page, { decisionEngine: mock });
  const resolution = await engine.resolveIntent('Click anything');
  await engine.executeAction(resolution);
  // Only the executed candidate's marker is cleaned up immediately; stale markers on the
  // rest are swept on the next extraction pass instead (see domExtraction.ts).
  expect(await page.locator(`[data-bie-id="${resolution.candidateId}"]`).count()).toBe(0);
});

test('unmatched intent guards executeAction', async ({ page }) => {
  await page.setContent(HTML);
  const mock = new MockEngine(() => '__no_such_id__');
  const engine = new BrowserIntentEngine(page, { decisionEngine: mock });
  const resolution = await engine.resolveIntent('Do something impossible');
  expect(resolution.matched).toBe(false);
  await expect(engine.executeAction(resolution)).rejects.toThrow();
});
