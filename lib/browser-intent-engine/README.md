# BrowserIntentEngine

A small, framework-agnostic library that turns semantic goals ("Click the user
profile icon") into Playwright actions, by delegating the *which element?*
decision to a pluggable, choice-based System 1 decision engine.

It has **no dependency on any test runner, assertion library, or self-healing
test framework** — it only needs a Playwright `Page` and a decision engine
adapter. It currently lives inside this repo (`lib/browser-intent-engine`) to
reuse the Playwright install already here; it is self-contained and can be
lifted into its own package/repo later without changes.

## Architecture

```
Page (Playwright)
   │
   ▼
BrowserIntentEngine
   ├── extractCandidates()   private: scans the DOM, returns DomCandidate[]
   ├── resolveIntent(goal)   State + Question + Options -> DecisionEngineAdapter.decide()
   └── executeAction(res)    resolved candidate -> live Locator -> .click()/.fill()/...
                                   │
                                   ▼
                     DecisionEngineAdapter (interface)
                          ├── LayaDecisionEngineAdapter  (laya-ts, implemented)
                          └── JevDecisionEngineAdapter    (placeholder, pending SDK)
```

`BrowserIntentEngine` only ever imports the `DecisionEngineAdapter` interface
from `types.ts`. Swapping Laya for TypeSafe Jev (or anything else) means
writing a new adapter class — no changes to extraction, resolution, or action
execution code.

## Usage

```ts
import { chromium } from 'playwright-core';
import { BrowserIntentEngine, LayaDecisionEngineAdapter } from './lib/browser-intent-engine';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://example.com');

const decisionEngine = new LayaDecisionEngineAdapter({ modelPathOrRepo: './model' });
const engine = new BrowserIntentEngine(page, { decisionEngine });

const resolution = await engine.resolveIntent('Click the user profile icon');
if (resolution.matched) {
  await engine.executeAction(resolution);
} else {
  console.warn(`No confident match (${resolution.reason})`);
}

// Text inputs / selects need a value:
const usernameField = await engine.resolveIntent('Type into the username field');
await engine.executeAction(usernameField, { value: 'octocat' });
```

## Options

| Option              | Default          | Purpose                                             |
|---------------------|------------------|------------------------------------------------------|
| `decisionEngine`     | *(required)*     | The `DecisionEngineAdapter` to query.                |
| `selectors.include`  | built-in set     | Extra CSS selectors to scan.                         |
| `selectors.exclude`  | `[]`             | CSS selectors to always skip.                        |
| `maxCandidates`      | `150`            | Cap on extracted elements per resolution.            |
| `actionTimeoutMs`    | `5000`           | Default Playwright action timeout.                   |
| `requireVisible`     | `true`           | Only consider visible elements.                       |
| `markerAttribute`    | `data-bie-id`    | DOM attribute used to re-locate resolved candidates. |
| `textMaxLength`      | `80`             | Max captured text length per candidate.               |
| `minConfidence`      | `0` (disabled)   | Resolutions below this are reported as unmatched.     |

## Decision engines

- **Laya** (`LayaDecisionEngineAdapter`): wraps a Laya `Agent`/`Router` from
  `laya-ts`. The dependency is installed locally via
  `"laya-ts": "file:../laya/laya-ts"` — replace with a published registry
  version once Laya is published, and rebuild `laya-ts` (`npm run build` in
  that package) whenever its sources change, since `file:` installs a snapshot
  of `dist/`. `laya-ts` is ESM-only, so the adapter loads it via a lazy dynamic
  `import()` to stay compatible with this repo's CommonJS TypeScript setup.
- **TypeSafe Jev** (`JevDecisionEngineAdapter`): placeholder that throws until
  Jev's SDK is available; implement `decide()` there when it lands.

## Type-checking

```bash
npx tsc -p lib/browser-intent-engine/tsconfig.json
```
