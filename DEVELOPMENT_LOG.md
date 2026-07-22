# ETOS Development Log

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
