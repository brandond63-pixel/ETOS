# v0.5.9-dev — Distress Beacon Carrier Monitor

The Command Overview Distress Beacon tile now opens a modal overlay instead of navigating to a separate Command subsection. The overview remains visible behind the dimmed popup, matching the interaction language used by the Atmospheric Advisory and Corporate Directive documents.

The popup identifies Heron Station as the authenticated source and presents a live automatic-carrier cycle. The displayed countdown updates once per second, while the progress rail uses frame-synchronized transforms for continuous degradation between number changes. At zero, the display enters a short `TRANSMITTING…` phase, increments the retransmission total, refills the rail, and starts a new 30-second countdown.

The retransmission default is `264,960`, matching 92 days of broadcasts at one transmission every 30 seconds. `RELAY HANDSHAKE // NO RESPONSE` distinguishes the station's missing acknowledgment from the broader Orbital Relay 04 online status.

The carrier deliberately provides no voice recording, audio controls, help message, survivor names, creature references, cause for the failed relay handshake, or confirmation of whether personnel remain alive.

# v0.5.8-dev — Active Directive Marker Alignment

The Directive 015 state marker previously used absolute right-edge positioning, causing it to drift into the Priority column at wide aspect ratios. The archive rows now define a dedicated center marker column between the directive title and priority metadata.

The marker uses larger text and a steady, equal-interval on/off blink. The remaining directive rows retain the same title, priority, and status alignment without placeholder content.

# v0.5.7-dev — Directive Overlay Presentation

The Directive Archive was visually compressed after widescreen testing revealed excessive negative space in the three equal-height records. The records now use compact ledger rows inside a centered maximum-width index rather than stretching to fill the available module height.

Directive 015 now receives immediate hierarchy through an incoming executive-directive notification, an active leading edge, and a `NEW // ACTIVE` marker. Once the document is successfully opened, the notification changes from review-required to mission-active for the current loaded session.

Individual directives now open as centered corporate-document overlays over the dimmed archive, following the interaction language established by the Atmospheric Advisory. The Directive 015 authorization screen and hidden hack animation use the same overlay layer. All supplied text, password behavior, three-second hidden emblem hold, and session-only relock behavior are unchanged.

# v0.5.6-dev — Corporate Directive Archive

The existing Corporate Directive detail placeholder was replaced with a self-contained Command subsystem. Opening the main Directive panel now presents only the three supplied records: ET-CS-001, ET-CS-014, and ET-CS-015. Directives 001 and 014 open normally. Directive 015 presents an executive clearance screen authorized for Dr. Claire Edem and 2LT Kaplan.

Directive 015 accepts authorization code `51895`. A second, deliberately undisclosed player-interface route is available for Warden-adjudicated hacking: holding the Ellison-Tanaka emblem on the lock screen for three seconds starts a four-second security bypass display and unlocks the document for the current application session. The hold produces no early feedback or visible hint.

All three documents use the final Claire Edem name and retain the provided corporate language, objectives, coordinates, status fields, and performance metrics. The archive and document viewer were implemented inside the existing Command module so the approved Command Overview layout, live editor, weather tools, terminal switching, and offline framework remain untouched.

# v0.5.5-dev

- Replaced the Command Overview panel defaults with the exact layout copied from the live editor.
- Preserved the approved typography and layout/animation defaults.
- Advanced overview storage keys to v7 and added a fresh migration marker so this build installs the new defaults once.
- Retained the visible repositioned Layout Editor toolbar and all developer controls.

# v0.5.4-dev

Adjusted the Command Overview live editor overlay after the v0.5.3 toolbar overlapped the top terminal chrome. The final CSS override positions it below both headers and constrains it to the visible viewport.

# v0.5.3-dev

- Reapplied approved Command Overview JSON using clean v6 storage keys.
- Added cache-busting asset URLs so old JavaScript and CSS cannot be reused.
- Moved Layout Editor controls to the top of the screen.
- Added clearly labeled panel-only and complete overview copy buttons.

## v0.5.2-dev — Main Window Baseline Lock

The approved Command Overview configuration is now part of the project source rather than only browser-local state. Future builds should inherit these constants unless the user explicitly approves a new baseline. Developer tools remain available for refinement.

## v0.4.9-dev — Control Binding Repair

The controls were correctly receiving input events and saving values, but the CSS variables were being written to the workspace parent. The overview canvas defined its own default variables, overriding inherited values. Both typography and layout settings now write directly to `.command-overview-shell`, which is the element consuming those variables.


## v0.4.3-dev — Command Overview Redesign
- Rebuilt the Command landing page as a Corporate Tactical / Retro-Futurist operations console.
- Added a dominant whole-panel weather alert and functional panels for distress beacon, corporate directive, communications, and base/orbital status.
- Added shaped CRT framing, stronger visual hierarchy, passive status stack, and identity rail.
- Added dedicated detail screens and Return to Systems navigation.
- Added visible loading and error states for large document images.
# ETOS Development Log

## v0.5.10-dev — Communications History and Archived Signal

The Command Communications placeholder was replaced with a dedicated two-column history interface. The left side presents six dated operational records in a clean message ledger, while the right side presents the selected record’s sender, recipient, delivery state, and recovered content. A summary rail distinguishes continued passive telemetry from the loss of two-way contact and reports two outgoing messages waiting for delivery.

The chronology now establishes the Surface Reconnaissance Assignment in December 2121, the Biological Specimen Report in February 2122, the executive mission change in March, loss of Orbital Relay contact in early July, Dr. Edem’s undelivered support request, and the interrupted automatic emergency report during the July 18 commissary event. Communications links to Directives 014 and 015 enter the existing archive normally; Directive 015 remains protected by its password and hidden Warden-controlled hack route.

The Unidentified Broadcast is separated from official traffic as a locally archived signal. Its player uses the approved 11.5-second V3 organic insect scream stored at `assets/audio/archived-signal-0718.wav`. Playback includes a custom waveform, progress rail, elapsed-time display, play/pause state, and clinical local-event logging language without revealing the signal’s true purpose.

The supplied transparent `ellison-tanaka-logo.svg` is now the only corporate identity image referenced by the visible interface. Boot, Directive documents, the hidden Directive 015 hack target, Weather branding, and Command navigation all use the same source asset, removing the dim rectangular background inherited from the prior PNG artwork.

## Entry 001 — Project Foundation
Date: 2026-07-22
Version: 0.1.0

### Objective
Create a stable, testable foundation for the Ellison-Tanaka Operating System before adding campaign-specific terminal content.

### Architectural Decision ADR-001
ETOS will be an offline-capable Progressive Web App built with plain HTML, CSS, and JavaScript. It will be installed to an iPad Home Screen and launched in standalone landscape mode.

### Implemented
- Core project directory and asset structure
- Corporate boot and initialization screen
- Shared terminal shell
- Hidden Warden control panel
- Four terminal identities
- Eight-second terminal transition
- Local state persistence
- Offline cache and install manifest

### Warden Interaction Decision
The Warden panel is opened by holding the corporate logo for three seconds. This keeps player-facing navigation free of visible administrative controls. A PIN provides an additional barrier against accidental access.

### State Decision
Session state is stored in `localStorage`. This is sufficient for the initial single-iPad implementation. Export/import tools can be added after the state model becomes more complex.

### Risks and Follow-Up
- iPad installation and audio behavior require real-device testing.
- Local hosting instructions must eventually be simplified for campaign-day setup.
- The Warden PIN is currently stored in client-side JavaScript and is intended as concealment, not security.
- Terminal-specific content architecture should be established before adding large amounts of data.

### Next Recommended Milestone
v0.2.0 — Terminal Module Framework
- Separate terminal definitions from application logic
- Add reusable file, message, personnel, and media components
- Add terminal-specific themes and navigation
- Add a Warden debug status view

## Entry 002 — Consolidated Device-Test Fixes

### Objective
Remove the display-state, hidden-control, and stale-cache problems discovered during the first iPad and iPhone tests.

### Findings
- CSS display declarations overrode the HTML `hidden` attribute.
- Warden access was only attached to the boot logo, making it inaccessible after initialization.
- Cache-first development behavior made tiny updates unnecessarily difficult to verify.

### Decisions
- Add a global `[hidden]` CSS rule.
- Bind the Warden hold gesture to both the logo and active terminal heading.
- Add explicit Return to Boot and Check for Latest Build controls.
- Use network-first loading for core code during development while retaining offline fallback.
- Publish complete replacement builds instead of asking the user to patch individual code lines.

### Next Milestone
Validate v0.1.3-dev on desktop and iPad, then begin v0.2.0 Terminal Module Framework.

## Entry 004 — One-Click Windows Development Server

### Objective
Remove third-party setup requirements from the desktop development loop.

### Decision
ETOS development packages now include a Windows batch launcher and a bundled PowerShell TCP web server. The launcher requires no Python, Node.js, Visual Studio Code, or browser extension.

### Operation
- Double-click `Start ETOS.bat`.
- ETOS opens at `http://localhost:8080`.
- The server sends no-cache headers so edits can be tested with a normal browser refresh.
- Closing the server window ends the local session.

### Scope
This launcher is intended for desktop development. GitHub Pages remains necessary for realistic iPad PWA, touch, standalone, and offline milestone tests.

## Entry 005 — Terminal Module Framework

### Objective
Prove that ETOS terminals can share one operating-system core without appearing identical.

### Decisions
- Command uses a dense operational dashboard and numbered module navigation.
- Medical uses a clean clinical layout, cyan palette, and vitals-oriented presentation.
- Dr. Edem uses a warm personalized desktop with folders and handwritten annotations.
- Argoza uses a blue shipboard console with navigation and cryogenic system panels.
- Command serves as the first complete reference module.
- Documents open through one reusable full-screen viewer.

### Validation Target
Confirm all Command navigation modules and document files open correctly, then switch through all four terminals and verify each has a distinct visual identity.


## Entry — v0.2.3-dev Planetary Weather Surveillance

Implemented the first polished Command Terminal subsystem. Weather telemetry uses bounded ranges rather than unconstrained random values. CRT effects are deliberately subtle for iPad readability. The command overview weather panel is functional and opens the full surveillance interface.


## Entry — v0.2.3-dev Weather Repair
The v0.2.2 weather refactor accidentally removed shared panel framing and relied on a single image element for the central composite. This build restores the complete panel styling and uses a redundant CSS background so the terrain/storm remains visible even if the image element fails to render.


## Entry 006 — Weather Display Refinement
Date: 2026-07-23
Version: 0.2.6-dev

### Objective
Make the weather display read as a live satellite composite rather than a collection of separate dashboard panels.

### Implemented
- Full-height central terrain composite
- Subtle independent storm movement over fixed terrain
- Slow blinking triangular location markers
- Combined projected-track and observations legend
- Removed decorative circular pulse animation

### Design Decision
The terrain remains stable while only the storm layer moves. Animation is restrained so the screen remains readable and does not resemble a stylized radar sweep.

## Entry — v0.3.0-dev Weather Layout Sandbox
Created an in-browser tuning tool to replace the slow rebuild cycle. The current composite remains a temporary reference asset; crop, column widths, and marker alignment can now be adjusted live and copied as JSON.


## Entry — v0.3.7-dev
Built the second-stage Weather Development Tool. The approved screen layout is now the default. All code-rendered map elements and storm-layer animation can be positioned and tuned live without rebuilding the application.


## v0.3.7-dev — Weather Viewport Diagnosis
The map assets were valid and correctly packaged. The blank panel was caused by `.radar-map` being changed from an absolute, full-panel viewport to a relatively positioned element with only absolutely positioned children, collapsing its computed height to zero. The viewport is now explicitly anchored to all four edges of `.weather-radar-panel` with 100% width and height.


## Weather Layout Approval — v0.3.7-dev
The user-approved sandbox values were locked as the default weather-map configuration. The weather terminal was simplified to reflect a newly restored system: historical system-log chatter was removed and replaced with a single power-restored timestamp. Right-column hierarchy, communications states, impact probabilities, advisory typography, composite labeling, and corporate emblem presentation were refined.


## Entry — v0.3.7-dev startup repair
The v0.3.5 build contained a structural JavaScript regression: terminal profiles were accidentally inserted inside the Command section registry, leaving `profiles` undefined at runtime. The command registry and terminal profile registry were restored and browser-tested before packaging.


## Entry — v0.3.7-dev Command Interaction Pass
- Adopted a one-palette-per-terminal rule; Command now uses green CRT shades only.
- Replaced duplicate left-side module navigation with Return to Systems on subsystem pages.
- Made the entire weather alert panel interactive and keyboard accessible.
- Reworked storm animation into a seamless continuous rotation with live 10–600 second developer control.
- Preserved independent marker blinking and the approved weather map layout.
## v0.5.11-dev — Communications Refinement and Diagnostic

- Added a Communications-specific typography drawer governed by the existing Warden developer-controls preference.
- Added live font variables for summary, list, detail, metadata, body, controls, and footer text with source-baked defaults and copyable JSON output.
- Kept Corporate Directive links inside Communications by reusing the existing directive document, lock, password, and hidden three-second hack components in a dismissible overlay.
- Separated the unknown Relay 04 capture from Dr. Hinton's later commissary PA playback request so the archive now presents a neutral intercept followed by a deliberate local system action.
- Generated a normalized 180-column peak envelope from the approved V3 WAV and connected the played waveform, playhead, progress rail, and elapsed-time display to the same audio clock.
- Replaced the overly interpretive commissary-event emergency copy with an automated report manually initiated from Dr. Claire Edem's private terminal and queued for automatic retry.
- Added a compact top-row diagnostic alert and modal report describing the mismatch between Category IV atmospheric attenuation and complete orbital-uplink failure.
- Preserved all previous terminal, weather, beacon, Directive 015 security, logo, and offline behavior.
## v0.5.12-dev — Communications Typography Lock and Playback Readiness

- Promoted the user-approved Communications typography JSON to the v2 source defaults.
- Added a persistent warmup audio object when Communications opens and changed the visible player to `preload="auto"`.
- Added load, data-ready, can-play, waiting, stalled, playing, pause, end, and error handling so the status label reflects actual media readiness.
- Added a retry path and separate blocked-playback language while preserving user-gesture playback requirements.
- Replaced the corporate SVG contents with the supplied transparent symbol-only artwork while retaining the established asset path across all interface references.
- Increased the date and status tracks in the Transmission Log, rebalanced the list/detail split, and kept record dates, titles, and statuses on one line where space permits.
- Removed the 850-pixel paragraph cap responsible for premature wrapping and protected signal routes and inline actions from unnecessary breaks.

## v0.5.13-dev — Communications Diagnostic Scale Pass

- Reworked the Communications Diagnostic as a 1,400-pixel wide-format exception report at the reference display size.
- Increased every diagnostic text tier in proportion to the approved Communications typography, including the 43–61% expected loss and 100% observed loss values.
- Added more deliberate internal spacing and a vertically centered findings block so the expanded report reads as an important technical alert rather than a small utility dialog.
- Retained its existing comparison language, overlay dismissal, Communications context, and all prior application behavior.

## v0.5.14-dev — Startup Signal Preload

- Added a startup fetch for the approved 2.2 MB archived-signal WAV so its transfer begins before Communications is opened.
- Converted the completed response into a session-lived object URL shared by every rendered signal player, eliminating repeat file transfers between archive views.
- Added safe attachment logic that upgrades an idle player when preloading completes but never replaces audio that is already playing or has progressed.
- Kept the original packaged asset as the fallback source for browsers or file-launch modes that reject the startup fetch.

## v0.5.15-dev — Facility Management Foundation

- Replaced the Command Terminal's Base & Infrastructure placeholder with a Facility Management comparison and Horizon-specific records hub.
- Built separate telemetry timing models: Horizon values drift from the local facility bus, while Heron values update with the automated 30-second distress-carrier packet.
- Implemented Horizon and Heron condition assessments without confirming survivors or exposing unavailable Heron controls.
- Rebuilt the Horizon personnel organization as live HTML from a 25-person roster rather than using the old static chart image.
- Added a separate biosignal monitor protected by Dr. Edem's `51895` executive code. It reports signal state only and never exposes a personnel location.
- Added the supplied map exports unchanged in a layered interactive viewport. Room polygons provide touch-friendly selection while the floorplan, system elements, and maintenance routes remain independent layers.
- Added drag/pan, pinch and wheel zoom, zoom controls, selected-room highlighting, and a right-side neutral room information panel.
- Added a player-facing `VIEW MAINTENANCE SCHEMATICS` control protected by Demar's code, `12345`. The Illustrator master remains the artwork source of truth and is not bundled as a runtime asset.
- Added vehicle status and dispatch records, including APC-02 charging at Horizon and the unconfirmed Heron-bound evacuation manifest.
- Added a Work Order Archive with at-a-glance OPEN/CLOSED status and restrained summaries for ordinary records so they do not create unintended story clues.
- Added Heron Station's Reactor Thermal Advisory as passive telemetry received over the distress carrier, including the 18% cooling-water intake loss and unanswered engineering request.

## v0.5.16-dev — Facility Management Refinement

- Added startup image preloading for both Weather composite layers and corrected Weather title alignment and terminal-palette inheritance.
- Corrected the Distress Beacon chronology to July 18, 2122 and advanced the retransmission estimate to match the revised three-month broadcast window.
- Rebalanced Communications toward the detail pane without changing its record structure or archived signal behavior.
- Reorganized Facility Comparison so live telemetry establishes context before the two facility cards; added clearer station actions, contextual backgrounds, increased separation, and direct reactor-advisory access.
- Replaced top-level Facility back controls with contextual left-rail navigation and restyled the Horizon module launcher as compact, centered schematic tiles.
- Refined the interactive schematic with a faint grid, brighter floorplan labels, and a solid selected-room treatment while preserving pan, zoom, layered SVG architecture, and untouched exported artwork.
- Standardized the code-rendered personnel directory and biosignal monitor against the approved 25-person roster, including distinct Dr. Edem and 2LT Kaplan hierarchy cards and neutral SGT Valdez labeling.
- Added hidden three-second emblem-hold Warden bypasses to both Facility security screens without exposing player-facing hints.
- Added a Facility typography development tool governed by the existing Warden visibility setting, with live grouped controls, persistence, reset, and copied JSON output.
- Improved vehicle, work-order, and biosignal layouts, including vertical fleet records and separately aligned life-state and range-at-loss data.
- Added a portable text roster at `docs/ETOS_Personnel_Roster.txt`.

## v0.5.17-dev — Facility Layout and Navigation Pass

- Reorganized the Horizon local-systems screen into a left-weighted operational column with vertically stacked module buttons and a two-by-two live telemetry block.
- Used the open right side for a deliberately subdued Ellison-Tanaka identity field with the corporate slogan and a static scan interruption.
- Established a consistent Command rail hierarchy: contextual Facility back controls remain near the active module, while Return to Systems now occupies the bottom main-menu position.
- Added faint schematic grids to both personnel branches and increased the size and typographic hierarchy of the Edem and Kaplan command cards.
- Increased vehicle Dispatch History and Work Order History typography as baked source defaults.
- Corrected the final odd biosignal record so PFC Weaver remains aligned to the same half-width grid as every other record.
- Removed animation from selected map rooms while retaining the approved translucent fill, outline, and static glow.


## v0.5.18-dev — Horizon Base Brand Scale
- Removed the center divider overlay from the Horizon Base corporate brand panel.
- Increased emblem and wordmark scale for stronger visual presence.

### 0.5.23-dev schematic interaction hotfix
The 0.5.20 package retained 0.5.18 cache-busting query strings and an internal 0.5.19 JavaScript version. This could cause browsers to combine old and new assets. All asset query versions were advanced, control layering was reinforced, SVG initialization now tolerates individual overlay failures, and camera destination math was corrected.

### 0.5.24-dev schematic controls
Added controlled-door hatching, numeric alert positioning, reduced alert icon scale, and corrected alert target camera coordinates.

### 0.5.28-dev schematic bounds and door hatching
Restored explicit SVG hatch fills for controllable doors and clamped all camera transforms to the schematic viewport.
