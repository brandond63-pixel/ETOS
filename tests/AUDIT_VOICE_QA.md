# Audit Token microphone recovery QA

Run automated state tests with `node --test tests/audit-voice.test.cjs`.
For browser integration checks, run `node tests/audit-voice-server.cjs` and open
`http://localhost:8080/__audit-test__/` at 1024 x 768. Only this test route injects
the microphone/speech fixtures; the normal `/` route and deployed app do not.

The test toolbar provides permission grant/denial, recognition results, API
failure, unresolved initialization, and page interruption. Its hold controls
hit-test the real port/header and dispatch pointer events through the unchanged
three-second handlers. They do not shorten application timers or call private
workflow functions. This is simulated input, not native iPad touch certification.

## Native iPad / installed-PWA follow-up

Use the actual secure origin installed on the device. OS permission prompts and
the software keyboard cannot be certified by the desktop mock harness.

1. Fresh microphone permission: insert Token, wait for preparation, tap Initialize,
   grant permission, and verify listening begins only after capture starts.
2. Already granted: re-enter and initialize; verify no redundant prompt between
   the three normal attempts. Say the existing acquisition command or fail three
   times, then verify the existing manual passcode and authorization result.
3. Deny permission: tap the manual passcode field, type, Verify, and Abort. Open
   Warden with the normal three-second header hold before and after Abort.
4. Leave the prompt unanswered: after 30 seconds, return to the PWA and confirm
   manual fallback. Grant a delayed request if iPadOS still displays it; ETOS must
   not return to listening and the late stream must be released.
5. Switch away while permission is pending, then return: a timely grant may
   continue; expired or invalid sessions must recover to manual. Test a genuine
   page restoration separately from a brief system-dialog visibility change.
6. Abort while pending and while listening; reinsert the Token. Verify no prior
   callback or microphone capture survives. Confirm Warden remains accessible.

ETOS cannot dismiss or accept an iPadOS system permission dialog itself. The
30-second watchdog and lifecycle recovery govern ETOS state when JavaScript can
run; a system-owned prompt may still need to be dismissed by the user.

## Implementation references

- [getUserMedia permission behavior](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia): an unanswered request may never settle, so the watchdog invalidates the session and any late stream is stopped.
- [SpeechRecognition audiostart](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/audiostart_event): the listening state follows actual audio capture, not merely calling `start()`.
