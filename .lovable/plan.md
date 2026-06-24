# Multi-fix UX pass

Tackling all seven items in parallel. Each is scoped and independent.

## 1. PWA splash (2s)
Add a lightweight splash overlay rendered from `index.html` inline script + CSS that shows the app logo/background for ~2 seconds when launched from the home-screen (standalone mode). It auto-fades out after 2s or once React mounts (whichever is later). No service worker changes — manifest-only territory.

## 2. English loading text in chat
Audit chat loading copy (`TypingIndicator`, `ThinkingLoader`, `RemoteAiBusyBanner`, media/site/slides/docs card loaders, deep-research status lines, mobile service panels). Replace any Arabic loading strings with English equivalents ("Thinking…", "Generating video…", "Building website…", "Researching…", "Composing slides…", etc.). Non-loading UI stays Arabic.

## 3. Hide intro cards/buttons on first message (all modes)
On the chat landing surface (desktop + mobile), once the user sends their first message, fade-out + collapse:
- Deep research template picker card
- Slides template button row
- Greeting / mode chips / integrations strip / megsy-os intro
- Any "quick action" cards

A small reopen affordance lives inside the composer (reuse the existing `+` / mode button) — toggling it animates the cards back in. Clean `fade-out` + height collapse (200–250ms).

## 4. Hide composer inside Slides preview & Docs
When the slides full-preview overlay or the docs viewer is open, hide:
- the bottom composer/input bar
- the model selector button
- the sidebar trigger
So the preview is unobstructed. Closing the preview restores them.

## 5. Visible back button on mobile
The current back button overlaps the top bar on mobile inside slides/docs. Give it a solid contrast pill (bg-background/90 backdrop-blur, border, shadow) and lift its z-index above the header. Verify on a 390px viewport via Playwright.

## 6. Invite-friends sidebar parity
The referral page sidebar uses a different drawer shape and close animation than the rest of the app. Replace it with the shared `Sheet`/sidebar primitive used elsewhere so shape, slide-in, and close animation match.

## 7. Verification
After implementation, run Playwright headless at 390×844 logged in as the provided test account, screenshot:
- chat landing → after sending one message (cards gone)
- slides preview (composer hidden, back button visible)
- docs viewer (composer hidden, back button visible)
- referral page open + close sidebar

## Technical notes
- Splash: inline `<div id="pwa-splash">` in `index.html` shown only when `matchMedia('(display-mode: standalone)').matches`, removed after 2000ms.
- Card hiding state lives in the chat landing component; persisted only for the session (resets when user clicks the composer toggle).
- Composer hiding uses existing `isPreviewOpen` / route checks; no new state plumbing.
- Will NOT touch business logic, message persistence, or backend code.

## Out of scope
- Translating the entire app to English (only loading copy).
- Reworking the sidebar primitive — only swap the referral page to use it.
