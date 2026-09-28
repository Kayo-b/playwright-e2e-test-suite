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
                                   │
                          SystemOneHttpAdapter (POST /v1/systemone over HTTP)
                          ├── LayaDecisionEngineAdapter  → local laya-serve (on-device)
                          └── JevDecisionEngineAdapter   → https://api.typesafe.ai (hosted)
```

`BrowserIntentEngine` only ever imports the `DecisionEngineAdapter` interface
from `types.ts`. Both Laya and Jev speak the identical `/v1/systemone` HTTP
wire protocol (Laya's local server deliberately mirrors Jev's hosted API), so
both adapters are thin presets over one shared `SystemOneHttpAdapter` — no
changes to extraction, resolution, or action execution code either way.

## Usage

Laya runs as a **separate local process**, not embedded in Node. Start it
once (see `IMPLEMENTATION.md` for full setup):

```bash
cd /home/kxyx/projects/laya
LAYA_MODELS=english laya-serve   # http://127.0.0.1:8000 by default
```

Then, from this repo:

```ts
import { chromium } from 'playwright-core';
import { BrowserIntentEngine, LayaDecisionEngineAdapter } from './lib/browser-intent-engine';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://example.com');

const decisionEngine = new LayaDecisionEngineAdapter({ baseUrl: 'http://127.0.0.1:8000' });
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
| `logging.enabled`    | `false`          | Writes debug logs (DOM extraction + query + decision) to `logs/browser-intent-engine/<run>/`. |
| `logging.dir`        | `logs/browser-intent-engine` | Root directory for debug logs.          |
| `logging.runId`      | timestamp at process start | Subfolder grouping one run's calls together. |
| `selectors.include`  | built-in set     | Extra CSS selectors to scan.                         |
| `selectors.exclude`  | `[]`             | CSS selectors to always skip.                        |
| `maxCandidates`      | `150`            | Cap on extracted elements per resolution.            |
| `actionTimeoutMs`    | `5000`           | Default Playwright action timeout.                   |
| `requireVisible`     | `true`           | Only consider visible elements.                       |
| `markerAttribute`    | `data-bie-id`    | DOM attribute used to re-locate resolved candidates. |
| `textMaxLength`      | `80`             | Max captured text length per candidate.               |
| `minConfidence`      | `0` (disabled)   | Resolutions below this are reported as unmatched.     |

## Decision engines

Both presets below are thin wrappers over `SystemOneHttpAdapter`, a generic
HTTP client for the `/v1/systemone` wire protocol (state + questions in,
choice + confidence out) — see `IMPLEMENTATION.md` for how that protocol was
confirmed to be shared between the two.

- **Laya** (`LayaDecisionEngineAdapter`): talks to a **local `laya-serve`
  process** (default `http://127.0.0.1:8000`), running Laya entirely
  on-device. No API key needed unless the server was started with
  `LAYA_API_KEY` set. Start the server separately (`pip install "laya[serve]"`
  then `laya-serve`) — it is not managed by this repo.
- **TypeSafe Jev** (`JevDecisionEngineAdapter`): talks to Jev's **hosted** API
  (`https://api.typesafe.ai`). Requires a real API key via `{ apiKey }` or the
  `JEV_API_KEY` env var (the legacy `TYPESAFE_API_KEY` name also works; get a
  key at console.typesafe.ai); throws immediately if neither is set. Defaults
  `model` to `"jev-latest"` since, unlike Laya, the hosted API rejects a null
  model. Put your key in a repo-root `.env` file (gitignored) --
  `playwright.config.ts` loads it automatically via `process.loadEnvFile()`.

## Debug logging

Set `logging: { enabled: true }` to write, for every `resolveIntent()` /
`executeAction()` call, exactly what was extracted from the DOM, the exact
query sent to the decision engine, and its raw answer:

```ts
const engine = new BrowserIntentEngine(page, {
  decisionEngine,
  logging: { enabled: true }, // writes to logs/browser-intent-engine/<run>/
});
```

Each run gets its own timestamped folder under `logs/browser-intent-engine/`
(gitignored) containing:

| File | Contents |
|---|---|
| `NNN-<goal-slug>.json` | One full record per `resolveIntent()` call: candidates extracted, exact query payload, raw model answer, final resolution. |
| `run.jsonl` | Same records, one JSON object per line, for quick `jq`/grep-based analysis. |
| `run.md` | Human-readable rendering: a candidates table, the JSON query sent to the model, its raw decision, and the resolved outcome, per call. |
| `actions.jsonl` | One line per `executeAction()` call: which candidate/interaction ran and whether it succeeded. |

Disabled by default, so the mock-based regression suite
(`tests/browser-intent-engine.spec.ts`) never touches the filesystem.
`tests/browser-intent-engine.laya-live.spec.ts` and
`tests/browser-intent-engine.jev-live.spec.ts` both enable it, since those
are the suites exercising a real page + real model.

## Type-checking

```bash
npx tsc -p lib/browser-intent-engine/tsconfig.json
```
