# BrowserIntentEngine — Implementation Notes

Status: implemented on branch `feature/browser-intent-engine`, not merged into
`main`.

## What was implemented

A standalone, framework-agnostic library, `BrowserIntentEngine`, that resolves
semantic goals (e.g. `"Click the user profile icon"`) into Playwright actions
by delegating the *which element?* decision to a pluggable, choice-based
System 1 decision engine running as a **local HTTP server** — not embedded
in-process.

| Path | Purpose |
|---|---|
| `lib/browser-intent-engine/types.ts` | `DecisionEngineAdapter` contract (State/Question/Options in, `choice` + confidence out). The only thing the engine depends on. |
| `lib/browser-intent-engine/domExtraction.ts` | In-page DOM scanner run via `page.evaluate` — finds buttons, links, inputs, textareas, `[onclick]`, `contenteditable`, cursor-pointer heuristics; stamps each match with a `data-bie-id` marker for later re-location. |
| `lib/browser-intent-engine/BrowserIntentEngine.ts` | Main class: private `extractCandidates()`, `resolveIntent(goal)`, `executeAction(resolution, opts)` with `.click()/.fill()/.check()/.selectOption()` dispatch. |
| `lib/browser-intent-engine/adapters/SystemOneHttpAdapter.ts` | Generic HTTP client for the `/v1/systemone` wire protocol. Shared by both presets below. |
| `lib/browser-intent-engine/adapters/LayaDecisionEngineAdapter.ts` | Thin preset over `SystemOneHttpAdapter` pointed at a **local `laya-serve` process** (default `http://127.0.0.1:8000`). |
| `lib/browser-intent-engine/adapters/JevDecisionEngineAdapter.ts` | Thin preset over `SystemOneHttpAdapter` pointed at TypeSafe Jev's **hosted** API (`https://api.typesafe.ai`), requiring `TYPESAFE_API_KEY`. |
| `lib/browser-intent-engine/index.ts` | Barrel export. |
| `lib/browser-intent-engine/README.md` | Usage guide and options reference. |
| `tests/browser-intent-engine.spec.ts` | Regression tests against a mock adapter (no server needed). |
| `tests/browser-intent-engine.laya-live.spec.ts` | Real, non-mocked integration test against a running local `laya-serve` instance (auto-skips if none is reachable). |

It has no dependency on any test runner, assertion library, or self-healing
test framework beyond using Playwright's `Page`/`Locator` types.

## Architecture: one HTTP protocol, two presets

Laya ships an optional server mode (`laya[serve]` extra, `laya/serve.py` in
the Laya monorepo) that exposes `POST /v1/systemone`. Its own docstring says
this route is **deliberately shaped to match TypeSafe Jev's hosted API wire
protocol** — confirmed by inspecting the published `typesafe-sdk` Python
package (`typesafe_sdk._core.constants.py`: `SYSTEM_ONE_PATH = "/v1/systemone"`,
`DEFAULT_BASE_URL = "https://api.typesafe.ai"`, `Authorization: Bearer <key>`).

Because the wire protocol is identical, `BrowserIntentEngine` needs exactly
one HTTP client implementation (`SystemOneHttpAdapter`). `LayaDecisionEngineAdapter`
and `JevDecisionEngineAdapter` are both just presets over it with a different
`baseUrl`/auth scheme:

```
                         POST {baseUrl}/v1/systemone
                         { state, model, questions } -> { model, answers, usage }
                                      │
        ┌─────────────────────────────┴─────────────────────────────┐
        │                                                            │
LayaDecisionEngineAdapter                              JevDecisionEngineAdapter
baseUrl: http://127.0.0.1:8000                        baseUrl: https://api.typesafe.ai
(local process, on-device, no API key needed)          (hosted, requires TYPESAFE_API_KEY)
```

Swapping engines is a one-line change in the caller — `BrowserIntentEngine`
itself never changes:

```ts
import { BrowserIntentEngine, LayaDecisionEngineAdapter, JevDecisionEngineAdapter } from './lib/browser-intent-engine';

// Local, on-device:
const decisionEngine = new LayaDecisionEngineAdapter({ baseUrl: 'http://127.0.0.1:8000' });

// Hosted, once you have credentials:
// const decisionEngine = new JevDecisionEngineAdapter({ apiKey: process.env.TYPESAFE_API_KEY });

const engine = new BrowserIntentEngine(page, { decisionEngine });
```

## Where Laya lives — running a local server

Laya is **not embedded in this repo or Node process**. It runs as a separate
local process (`laya-serve`), started once, that this repo's adapter talks to
over HTTP. This is the architecture the user asked for explicitly: *"the idea
is to have a local laya running in a server locally and use that in
combination with playwright."*

**Source:** the Laya monorepo at `/home/kxyx/projects/laya` (provided
directly by the user, not published to npm). The server lives at
`laya/serve.py` inside that repo and is a FastAPI app started via the
`laya-serve` console script (`[project.scripts] laya-serve = "laya.serve:main"`
in `pyproject.toml`).

### Setup (one-time, on this machine)

```bash
cd /home/kxyx/projects/laya
python3 -m venv .venv-export        # already created; reuse it
.venv-export/bin/pip install -e .                       # laya core (torch, transformers, safetensors, huggingface_hub)
.venv-export/bin/pip install fastapi uvicorn python-multipart   # the "serve" extra
```

### Starting the server

```bash
cd /home/kxyx/projects/laya
LAYA_MODELS=english LAYA_HOST=127.0.0.1 LAYA_PORT=8000 LAYA_PRELOAD=1 \
  .venv-export/bin/laya-serve
```

- `LAYA_MODELS=english` preloads only the base English checkpoint
  (`convaiinnovations/laya`, ~843MB, auto-downloaded from Hugging Face Hub on
  first run and cached under `~/.cache/huggingface`); omit it to preload all
  three published variants (english / multilingual / typed-decisions, several
  GB combined).
- First start downloads the checkpoint (a few seconds on a warm HF cache);
  subsequent starts load straight from the local cache.
- Once running: `Uvicorn running on http://127.0.0.1:8000`.

### Verifying it's up

```bash
curl -s http://127.0.0.1:8000/health
# {"status":"ok","loaded":["english"],"revisions":{...},"device":"auto"}

curl -s -X POST http://127.0.0.1:8000/v1/systemone \
  -H "Content-Type: application/json" \
  -d '{"state":"...", "questions": {"q": {"type":"choice","instructions":"...","criteria":["a","b"]}}}'
```

Confirmed working end-to-end on this machine: a realistic DOM-selection-style
question ("click the button that completes the purchase" against a 3-option
checkout page) returned the correct answer with 91% confidence.

### Server configuration reference (env vars, from `laya/serve.py`)

| Var | Default | Purpose |
|---|---|---|
| `LAYA_HOST` | `0.0.0.0` | bind address |
| `LAYA_PORT` | `8000` | bind port |
| `LAYA_MODELS` | (all) | comma-separated subset to preload: `english`, `multilingual`, `typed-decisions` |
| `LAYA_PRELOAD` | `1` | load checkpoints at startup vs. lazily on first request |
| `LAYA_DEVICE` | `auto` | `cpu` / `cuda` / `auto` |
| `LAYA_API_KEY` | (unset) | if set, requires `Authorization: Bearer <key>` on every request |
| `LAYA_MAX_CONCURRENT` | `16` | concurrent request cap (503 beyond this) |

## TypeSafe Jev — hosted only, no local mode

Unlike Laya, Jev has no on-device/local mode: it is only available via
`https://api.typesafe.ai`, requires a `TYPESAFE_API_KEY` from
[console.typesafe.ai](https://console.typesafe.ai), and its only official SDK
is Python-only (`typesafe-sdk` on PyPI; no TS/JS SDK). `JevDecisionEngineAdapter`
talks to the same `/v1/systemone` HTTP contract directly (confirmed against
the published Python SDK's source), so no SDK wrapping was needed — but it
has not been exercised against the real hosted API since no API key is
available in this environment. It will throw a clear error at construction
time if no key is provided.

## How to run the tests

```bash
# from the repo root, on branch feature/browser-intent-engine

# mock-based regression suite — no server needed, always runs
npx playwright test tests/browser-intent-engine.spec.ts --project=chromium

# real, non-mocked integration test — needs a running laya-serve (see above);
# auto-skips with a clear message if none is reachable at LAYA_SERVE_URL
# (default http://127.0.0.1:8000)
npx playwright test tests/browser-intent-engine.laya-live.spec.ts --project=chromium

# whole suite (includes the pre-existing app e2e tests)
npx playwright test

# type-check just the new module
npx tsc -p lib/browser-intent-engine/tsconfig.json
```

Expected output with the server running: 8 passed total (6 mock-based +
1 real live-inference test + 1 combined run reporting both files).

## Branch reference

```
branch: feature/browser-intent-engine
base:   main
```

`main` is untouched; nothing here has been merged.
