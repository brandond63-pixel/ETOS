# ETOS Changelog

## v0.1.3-dev — Consolidated Development Build
Status: Development testing

### Added
- Hidden Warden access from both the boot logo and active terminal heading.
- Return to Boot Screen control in the Warden panel.
- Check for Latest Build control.
- Build number displayed inside Warden controls.
- More reliable pointer-based three-second hold gesture.

### Fixed
- Portrait warning now disappears correctly in landscape.
- Elements marked `hidden` now reliably disappear.
- Warden window closes when loading a terminal.
- Reset returns directly to the original boot screen.
- Active terminal remains available between launches without blocking Warden access.

### Development Behavior
- HTML, CSS, JavaScript, and manifest requests use a network-first strategy so deployed edits appear more quickly.
- Offline copies remain available when no network connection exists.

### Known Limitations
- Terminal modules are placeholders.
- GitHub Pages still needs to finish deploying before a new upload can be tested.
