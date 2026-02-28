# Manual Test Checklist

Run after extension reload (`chrome://extensions` -> Reload).

## Core popup behavior

1. Click extension icon and verify popup opens instantly.
2. Toggle each feature and verify state persists after closing/reopening popup.
3. Switch language `English <-> Turkce` and verify labels update.

## Watch page behavior

1. Open a standard `/watch?v=...` video.
2. Verify ad overlays are hidden/removed.
3. Verify anti-interruption UI does not block playback.
4. Change playback speed from popup; verify page refresh + applied state.
5. Enable loop and verify loop behavior.

## Resume + autoplay

1. Play a video for at least 20s and leave page.
2. Re-open same video.
3. Verify playback resumes near the last second and auto-plays.
4. Watch until near end; reopen and verify stale "near-end" resume is not kept.

## Home/feed layout

1. Open home page (`/`) and subscriptions/feed pages.
2. Verify ad tiles are removed.
3. Verify no blank ad placeholders remain in rich grid rows.

## Shorts / mobile variants

1. Open at least one shorts URL (`/shorts/...`).
2. Verify playback works and no ad stubs remain visible.

## Regression checks

1. Verify non-ad YouTube cards are not removed from home grid.
2. Verify normal skip/navigation buttons still work.
3. Verify extension popup still renders full content without scrolling issues.
