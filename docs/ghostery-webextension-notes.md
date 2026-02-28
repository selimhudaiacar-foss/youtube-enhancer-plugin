# Ghostery WebExtension extraction notes

- Package: `@ghostery/adblocker-webextension`
- Checked latest version: `2.14.1` (npm dist-tag `latest`)
- Extraction date: `2026-02-28`

## What was extracted and inspected

1. `dist/commonjs/index.js`
2. `dist/esm/index.d.ts`
3. `README.md`

## Key technical finding

`WebExtensionBlocker.enableBlockingInBrowser(...)` depends on:

- `browser.webRequest.onBeforeRequest.addListener(..., ['blocking'])`
- `browser.webRequest.onHeadersReceived.addListener(..., ['blocking', 'responseHeaders'])`

For Chromium MV3 extensions, production-safe ad blocking should rely on
`declarativeNetRequest` for network blocking.

## Integration decision for this project

To keep this extension stable on Chromium (YouTube-only target), ad blocking is
implemented using:

1. static DNR ruleset (`rules/youtube-ads.json`) for ad network/request blocking
2. page-level fallback in `main-world-script.js` (skip button click + ad overlay cleanup)

This keeps the extension lightweight and avoids shipping a large runtime engine.
