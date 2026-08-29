# ETOS Cleanup Report

Date: 2026-08-29  
Application version: `0.5.95-dev`

## Scope and audit method

The entire static ETOS repository was inventoried, including application JavaScript, all four theme stylesheets, shared HTML, the service worker and manifest, local server scripts, tests, documentation, the standalone `cryo/` experience, and every image/audio asset. Asset decisions used exact filename searches across the full repository plus duplicate SHA-256 hashes. JavaScript declarations were checked for call/reference counts. Potentially legacy CSS was treated conservatively because later rules rely on the existing cascade.

This repository has no `package.json`, lockfile, bundler, dependency manifest, lint configuration, or production-build script. It deploys directly as a static offline PWA, so there were no package dependencies to audit or remove and no compilation step to run.

## Deleted files

| File | Size | Why deletion was safe |
| --- | ---: | --- |
| `assets/audio/facility-emergency-alarm.wav` | 5,719,138 B | Unreferenced superseded copy; byte-identical to the active `699248__mozfoo__emergency-alarm.wav`. |
| `assets/audio/sanitization-warning-pulse.wav` | 75,014 B | Unreferenced superseded copy; byte-identical to the active `ETOS_sanitization_warning_pulse.wav`. |
| `assets/img/ellison-tanaka-logo.png` | 18,712 B | No runtime, stylesheet, PWA, test, or documentation path used it; the active interface consistently uses the SVG logo. |
| `assets/img/command/weather-radar-reference.png` | 3,166,454 B | Unreferenced old source/reference composite; current Weather uses `weather-terrain.png` and `weather-storm.png`. |
| `assets/img/command/weather-site-blink.png` | 21,070 B | Unreferenced replaced overlay; current base markers are code-rendered SVG/CSS elements. |
| `assets/img/command/weather-storm-overlay.png` | 1,113,825 B | Unreferenced replaced overlay; current storm layer is `weather-storm.png`. |

Total removed: **10,114,213 bytes (approximately 9.65 MiB)**.

These files were directly deleted from a folder that is not a Git checkout; they are not recoverable through repository history in this copy.

## Deleted code

- Removed `updateFacilityRoomSelection(root, id)` from `js/app.js`. Static reference analysis found its declaration to be its only occurrence; active Facility selection uses the current target/diagnostic handlers.
- Updated the README sentence that claimed the now-removed legacy PNG logo was retained.
- No CSS was deleted. Although `command.css` contains historical override blocks, many selectors are reused by the current Weather markup and their cascade is behaviorally significant. Removing isolated early declarations without a full cascade proof would violate the conservative cleanup rule.

## Deleted dependencies

None. The project has no package/dependency manifest and uses no installed runtime packages in production.

## Currently used and retained

- All four terminal themes and the shared shell/rendering/state code.
- Command Weather terrain/storm layers, Horizon map SVG layers, organization imagery, maps, recordings, and all Command/Audit/Sanitization audio.
- Medical images, including dynamically constructed `vial1.png`–`vial3.png` paths, genomic imagery, data-module and injector workflows.
- Argoza maps, portraits, personnel/mission content, recovery sequence, and briefing documents.
- Dr. Edem data-driven content, contour map, amber watermark emblem, journal, and `0718`-related authorization paths elsewhere in ETOS.
- Manifest icons, service worker, startup scripts, local-storage migration/reset paths, audio/microphone code, and install metadata.
- Warden-only controls, long-press/hack handlers, developer layout/typography tools, and sequence resets.
- `cryo/` in full. It is a separate current offline deliverable and its local copy of the SVG logo is required by its relative path.
- All tests, fixtures, local-only QA servers, `docs/command-overview-defaults.json`, and `docs/ETOS_Personnel_Roster.txt` because they support regression testing or documented development workflows.

## Retained despite appearing unused

- `assets/img/command/weather-terrain-storm.png`: current markup no longer selects this composite, but it remains referenced by historical Weather fallback CSS. It was retained rather than weakening a possible fallback path.
- `assets/img/ellison-tanaka-emblem.png`: not referenced by markup, but actively loaded by the Dr. Edem stylesheet as a watermark.
- `assets/img/vial1.png`, `vial2.png`, and `vial3.png`: filenames are assembled at runtime with ``assets/img/vial${Number(selected)}.png``.
- `cryo/assets/img/ellison-tanaka-logo.svg`: duplicates the main SVG by content but is required for the standalone cryo page's self-contained relative asset path.
- Warden/dev controls and microphone test fixtures: hidden or test-only by design, not dead material.
- Historical changelogs and development logs: documentation/archive material, not production imports.

## Uncertain / possible future cleanup

The following were not deleted because safe removal could not be proven without changing or re-baselining behavior:

- Historical Weather CSS layers in `css/themes/command.css`. There are duplicate-looking declarations from successive versions, but the current visual result depends on later overrides of earlier shared selectors.
- `assets/img/command/weather-terrain-storm.png`, as described above.
- Human-readable development/reference files under `docs/` and the two long-form history files. They are not runtime dependencies, but are intentionally referenced development records.
- Test-only HTTP servers and browser fixtures. They do not ship into the player UI, but they remain the only repeatable validation path for microphone, Warden hold, and Medical hardware gestures.

## Verification

- JavaScript syntax: **PASS** for `js/app.js`, `js/audio.js`, `js/argoza-recovery.js`, and `cryo/script.js`.
- Automated tests: **PASS — 78/78**.
- Static reference integrity: **PASS**. Every literal production asset, entry-point stylesheet/script, PWA icon, service worker, manifest reference, standalone cryo reference, and dynamically constructed vial asset resolves.
- Missing/deleted reference guard: **PASS**. Production sources contain no reference to any of the six deleted files.
- Dependency/build result: **N/A by project design**. No package manifest or build command exists; the source tree is the production static build.
- Lint/type-check result: **N/A**. No lint or type-check configuration exists.
- Browser/runtime smoke verification: **PASS at 1024x768**. Argoza Home/Crew, Command Overview/Weather, Medical Overview/Specimen Analysis/Containment, and Dr. Edem's terminal rendered through the shared shell. The active Weather terrain/storm images, Argoza portraits, Medical specimen/vial images, and Edem SVG/logo assets all completed with non-zero natural dimensions.
- Audio asset runtime verification: **PASS**. The Warden diagnostics fetched and decoded the retained warning pulse (`75,014` bytes, `0.850 sec`) and facility alarm (`5,719,138` bytes, `64.842 sec`) with HTTP `200` and `audio/wav`; the established mechanical audio assets also fetched and decoded successfully.
- Production-route isolation: **PASS**. The normal `/` route contained no test-fixture controls, while Warden access and terminal switching remained functional on the dedicated QA route.
- Standalone cryo entry point: **PASS**. `/cryo/index.html` rendered its terminal, controls, and self-contained SVG logo with no console errors.
- Runtime console: **PASS**. No errors or warnings were emitted during the terminal and asset smoke checks.

Warnings:

- Browser emulation can validate application routing, asset loads, layout containment, and console state, but it is not a substitute for native iPad microphone/audio permission testing.
