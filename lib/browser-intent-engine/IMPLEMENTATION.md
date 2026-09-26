# BrowserIntentEngine — Implementation Notes

Status: implemented on branch `feature/browser-intent-engine` (commit `5329f52`),
not merged into `main`.

## What was implemented

A standalone, framework-agnostic library, `BrowserIntentEngine`, that resolves
semantic goals (e.g. `"Click the user profile icon"`) into Playwright actions
by delegating the *which element?* decision to a pluggable, choice-based
System 1 decision engine.

| Path | Purpose |
|---|---|
| `lib/browser-intent-engine/types.ts` | `DecisionEngineAdapter` contract (State/Question/Options in, `choice` + confidence out). The only thing the engine depends on. |
| `lib/browser-intent-engine/domExtraction.ts` | In-page DOM scanner run via `page.evaluate` — finds buttons, links, inputs, textareas, `[onclick]`, `contenteditable`, cursor-pointer heuristics; stamps each match with a `data-bie-id` marker for later re-location. |
| `lib/browser-intent-engine/BrowserIntentEngine.ts` | Main class: private `extractCandidates()`, `resolveIntent(goal)`, `executeAction(resolution, opts)` with `.click()/.fill()/.check()/.selectOption()` dispatch. |
| `lib/browser-intent-engine/adapters/LayaDecisionEngineAdapter.ts` | Wraps a Laya `Agent`/`Router` (via `laya-ts`), lazy dynamic `import()` since `laya-ts` is ESM-only. |
| `lib/browser-intent-engine/adapters/JevDecisionEngineAdapter.ts` | Placeholder honoring the same interface; throws until TypeSafe Jev's SDK is available. |
| `lib/browser-intent-engine/index.ts` | Barrel export. |
| `lib/browser-intent-engine/README.md` | Usage guide and options reference. |
| `tests/browser-intent-engine.spec.ts` | Regression tests (see below). |

It has no dependency on any test runner, assertion library, or self-healing
test framework beyond using Playwright's `Page`/`Locator` types.

## Where Laya lives — there is no running Laya instance

Laya is **not a hosted service** and there is nothing running anywhere (no
Docker container, no listening port, no background process). This was
verified directly on this machine:

- `docker ps -a` — no Laya container, running or exited.
- `ss -tlnp` — no Laya port; the only relevant local listener is Ollama on
  `127.0.0.1:11434`, unrelated to Laya.
- `~/laya_models` — does not exist (this is where `laya-ts`'s Node examples
  expect exported checkpoints, per its own README).
- No `model`/checkpoint directory exists in the Laya repo or this repo.

This matches Laya's own design: its `AGENTS.md` explicitly states *"Laya is a
fast, local, on-device decision engine"* and forbids introducing a dependency
on a hosted service — it's meant to run in-process against a local ONNX/torch
checkpoint, not as a server you connect to (an optional `laya[serve]` HTTP
wrapper exists in `pyproject.toml`, but it isn't installed or running here
either).

**Source used for the integration:** the Laya monorepo at
`/home/kxyx/projects/laya` (provided directly by the user, not published to
npm). The TypeScript bindings this project depends on live at
`/home/kxyx/projects/laya/laya-ts`. That package ships no prebuilt `dist/`,
so it was built locally:

```bash
cd /home/kxyx/projects/laya/laya-ts
npm install
npm run build   # tsc -p tsconfig.json -> writes dist/
```

It's wired into this repo as a local file dependency (see `package.json`):

```json
"dependencies": {
  "laya-ts": "file:../laya/laya-ts"
}
```

Implication: `laya-ts`'s `dist/` is a **build snapshot**. If `/home/kxyx/projects/laya/laya-ts/src` changes, re-run `npm run build` there, then
`npm install` again in this repo to refresh the snapshot. Before this repo
leaves this machine, replace the `file:` dependency with a published
registry/git reference.

### To actually run inference through Laya

`LayaDecisionEngineAdapter` needs a real model checkpoint — none is present
on this machine. You'd need to either:
1. Point `modelPathOrRepo` at a local exported checkpoint directory (produced
   by `laya-ts/scripts/export_onnx.py --model-dir <ckpt> --out-dir ./model`
   from a trained Laya checkpoint), or
2. Point it at a Hugging Face Hub repo id (e.g. `"convaiinnovations/laya"`,
   per the `laya-ts` README), which downloads weights over the network at
   `Agent.load()` time.

Without either, `LayaDecisionEngineAdapter.decide()` will fail at the
`Agent.load(...)` call. This is why all current tests use a mock
`DecisionEngineAdapter` instead (see below) — they validate the
BrowserIntentEngine plumbing, not Laya's model accuracy.

## How to run the tests

The regression suite lives at `tests/browser-intent-engine.spec.ts` and uses
this repo's normal Playwright test runner — no extra setup, no model
checkpoint needed (it substitutes a deterministic in-memory
`DecisionEngineAdapter` mock for Laya/Jev).

```bash
# from the repo root, on branch feature/browser-intent-engine
npx playwright test tests/browser-intent-engine.spec.ts --project=chromium

# whole suite (includes the pre-existing app e2e tests)
npx playwright test

# type-check just the new module
npx tsc -p lib/browser-intent-engine/tsconfig.json
```

Expected output: 6 passed (click / fill / check / selectOption / marker
cleanup / unmatched-intent guard).

## Branch / commit reference

```
branch: feature/browser-intent-engine
commit: 5329f52 "feat(browser-intent-engine): add BrowserIntentEngine module with Laya adapter"
base:   main @ 4ca75e3
```

`main` is untouched; nothing here has been merged.
