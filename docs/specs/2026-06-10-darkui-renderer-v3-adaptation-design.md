# DarkUI → Nitro_Render_V3 adaptation — Phase 1 design

**Date:** 2026-06-10
**Status:** Approved (design); implementation pending
**Author session goal:** Get `duckietm/DarkUI` building and rendering on the local
`Nitro_Render_V3` (2.1.0) renderer with its dark theme preserved byte-for-byte.

## Problem

`duckietm/DarkUI` is an old community nitro-react (`nitro-react` 2.1.1, React 18,
TypeScript 4.3.5, SCSS/Bootstrap, last pushed 2024-08-23) carrying a custom **dark
theme**. It consumes `@nitrots/nitro-renderer` as a git **submodule** pinned to the
1.x renderer line (PixiJS 6/7 era).

We want DarkUI to run on the **local `Nitro_Render_V3` 2.1.0** monorepo renderer
(PixiJS 8) — the same renderer the local `Nitro-V3` client (`ui/`, nitro-react 3.5.0,
React 19, Tailwind) already runs on — so there is no version skew, and later to
backport features that DarkUI lacks from `Nitro-V3`. The user's hard requirement:
**the DarkUI theme must be preserved absolutely** (pixel-identical).

This is the same class of work already completed for `nitro-react-hubUI`
(see memory `project_hubui_renderer_adaptation`); that adaptation is the proven
playbook and Nitro-V3 (`ui/`) is the "Rosetta stone" since it is already on 2.1.0.

## Chosen strategy

**Modernize DarkUI in place** (not "reskin Nitro-V3"). DarkUI stays the base; its
theme/SCSS/components are kept unchanged. We swap the renderer (1.x → local 2.1.0)
and rewrite only what is required to boot on the new renderer. Re-implementing the
look on top of Nitro-V3's Tailwind was rejected because it would inevitably deviate
from the original theme — the user requires it preserved absolutely.

## Phasing

- **Phase 1 (this spec):** renderer swap + bootstrap rewrite → `yarn build` green +
  dev server mounts React and inits PixiJS 8 with **no console errors, no backend**.
  No new features. Theme untouched.
- **Phase 2 (later, separate spec):** backport missing Nitro-V3 features (modern
  catalog, navigator, messenger, etc.), each re-skinned in the DarkUI theme. Out of
  scope here.

## Phase 1 design

### A. Location & git
- Clone `duckietm/DarkUI` into `E:\Users\simol\Desktop\DEV\darkui` (sibling of `ui/`
  and `renderer/`, lowercase naming consistent with the existing folders).
- Fork `simoleo89/DarkUI`; work on branch `feat/adapt-nitro-render-v3`.
- Remove the `file:submodules/renderer` dependency; the renderer is consumed from the
  local `../renderer` source via Vite aliases (mirrors Nitro-V3, no submodule).

### B. Renderer integration
- **Vite aliases:** replicate Nitro-V3's `@nitrots/*` → renderer-source map
  (`@nitrots/nitro-renderer` → `../renderer/index.ts`; each sub-package
  `@nitrots/{api,assets,avatar,camera,communication,configuration,events,
  localization,room,session,sound,utils}` → `../renderer/packages/*/src/index.ts`),
  plus pixi/howler redirects and `server.fs.allow` for the renderer root.
- **Compat shim** `src/nitro-renderer-compat.ts`: alias `@nitrots/nitro-renderer` to
  the shim; the shim re-exports the real renderer (aliased `-real`) **plus** the
  symbols 2.1.0 dropped that DarkUI imports — at minimum `FriendlyTime`,
  `FixedSizeStack`, `NitroPoint` (= PixiJS 8 `Point`), `AdjustmentFilter`
  (from pixi-filters), and floorplan stubs (`NitroTilemap`, `PixiApplicationProxy`,
  `PixiInteractionEventProxy`, `POINT_STRUCT_SIZE`). Goal: leave the hundreds of
  consumer files untouched. The exact missing-symbol set is discovered during
  implementation (grep DarkUI's renderer imports against the 2.1.0 surface).

### C. Bootstrap rewrite
- 2.1.0 removed the `Nitro` singleton. Rewrite `App.tsx` / `index.tsx` to the
  imperative `prepare()` flow: config → `PrepareRenderer` → localization → assets →
  managers → tickers → communication. Re-point accessors (`GetNitroInstance`,
  `GetConfiguration`, `GetCommunication`, `GetLocalization`, `GetConnection`,
  `GetNitroCore`/`GetConfigurationManager`) to delegate to the new managers — same
  shape as the hubUI rewrite.
- `index.html`: `const NitroConfig` → `window.NitroConfig`.

### D. Theme — hard rule
- **Zero changes** to DarkUI's `.scss`, palette, assets, layout, or component markup.
  The theme *is* those files; they are preserved byte-for-byte. Add `sass` as a
  devDependency only if the build needs it. Touch only what is strictly required for
  the renderer swap and bootstrap.

### E. React
- **Stay on React 18** (DarkUI's version). Lower risk and less noise; React 19 is
  deferred to Phase 2 if ever needed.

### F. Runtime delta migration
Apply the known 1.x → 2.1.0 cheat-sheet as deltas surface at boot:
`TextureUtils.generateImage/generateImageUrl` now async (use
`generateCanvas(tex).toDataURL()` for sync); `ImageResult.getImage()` async,
`.data` is the texture; `imageReady` listener takes one `result` arg; PixiJS 8 renderer
canvas is `renderer.canvas` (not `.view`); avatar `processAsImageUrl(setType)` replaces
`getCroppedImage`; **all events route through the single global `GetEventDispatcher()`**
(per-manager `.events` getters are gone); custom Pixi filters must migrate to the
PixiJS 8 `GlProgram` + `UniformGroup` API; PixiJS 8 blend modes are strings.

## Verification ("done" for Phase 1)
1. `yarn build` completes clean.
2. Dev server (`vite --host 127.0.0.1 --port 5181` — 5173 is EACCES on this Windows
   box; 5180 belongs to hubUI) mounts React, prints the renderer banner, and inits
   PixiJS 8 (webgl2) with **zero console errors**, with **no backend**.
3. First boot-time runtime deltas fixed (filters, event dispatcher, canvas).
4. *Recommended:* `tsconfig.verify.json` type-check against the renderer source using
   the renderer's tsc (paths mirror the Vite aliases) — caught 40 signature deltas
   that build+grep missed in hubUI.

## Out of scope (Phase 1)
- Backporting Nitro-V3 features (Phase 2).
- A real PixiJS 8 floorplan-editor rewrite (stays a dormant stub, as in hubUI).
- Testing against the live Arcturus emulator (login → rooms → catalog).
- Any visual/theme change whatsoever.

## Risks & mitigations
- **Theme drift:** mitigated by the hard rule (E/D) — no SCSS/markup edits; verify the
  rendered login/UI visually matches the original DarkUI before declaring done.
- **Unknown renderer-API gap size:** hubUI needed only ~13 truly-missing symbols of 655
  imported; expect similar. The compat shim absorbs them without touching consumers.
- **Hidden signature deltas:** the optional tsconfig.verify type-check is the backstop.
- **Floorplan editor crash without an error boundary:** give the `PixiApplicationProxy`
  stub a real PixiJS 8 `Container` stage so `initialize()` completes dormant (hubUI fix).
