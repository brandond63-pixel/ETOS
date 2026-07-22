# ETOS v0.1.3-dev

Consolidated development build of the Ellison-Tanaka Operating System.

## Install on iPad or iPhone
1. Upload the contents of this folder to the root of the GitHub ETOS repository.
2. Wait for the newest GitHub Pages deployment to show a green checkmark under **Actions**.
3. Open the live ETOS site in Safari and refresh once.
4. Open ETOS from its Home Screen icon.

## Controls
- Initialize Terminal: enters the currently assigned terminal.
- Hidden Warden access: hold either the Ellison-Tanaka boot logo or the large active terminal heading for three seconds.
- Warden PIN: `8722`.
- Return to Boot Screen: returns to the original corporate screen without deleting the selected terminal.
- Reset All Session Data: restores the default Command terminal and boot screen.
- Check for Latest Build: requests the newest deployed files and reloads ETOS.

## Development Testing
The service worker uses network-first behavior for HTML, CSS, JavaScript, and manifest files. This reduces stale-build problems while preserving offline fallback.
