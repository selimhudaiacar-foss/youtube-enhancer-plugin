# Ghostery-derived YouTube filtering

This extension derives multiple YouTube-focused assets from Ghostery list
sources:

- Aggressive adtech host ruleset (DNR)
- Targeted YouTube ad-signal endpoint ruleset (DNR)
- YouTube cosmetic hide selectors (CSS)

## Source bundle (as used by Ghostery adblocker)

- `https://raw.githubusercontent.com/ghostery/adblocker/master/packages/adblocker/assets/easylist/easylist.txt`
- `https://raw.githubusercontent.com/ghostery/adblocker/master/packages/adblocker/assets/peter-lowe/serverlist.txt`
- `https://raw.githubusercontent.com/ghostery/adblocker/master/packages/adblocker/assets/ublock-origin/badware.txt`
- `https://raw.githubusercontent.com/ghostery/adblocker/master/packages/adblocker/assets/ublock-origin/filters-2020.txt`
- `https://raw.githubusercontent.com/ghostery/adblocker/master/packages/adblocker/assets/ublock-origin/filters-2021.txt`
- `https://raw.githubusercontent.com/ghostery/adblocker/master/packages/adblocker/assets/ublock-origin/filters-2022.txt`
- `https://raw.githubusercontent.com/ghostery/adblocker/master/packages/adblocker/assets/ublock-origin/filters-2023.txt`
- `https://raw.githubusercontent.com/ghostery/adblocker/master/packages/adblocker/assets/ublock-origin/filters-2024.txt`
- `https://raw.githubusercontent.com/ghostery/adblocker/master/packages/adblocker/assets/ublock-origin/filters.txt`
- `https://raw.githubusercontent.com/ghostery/adblocker/master/packages/adblocker/assets/ublock-origin/quick-fixes.txt`
- `https://raw.githubusercontent.com/ghostery/adblocker/master/packages/adblocker/assets/ublock-origin/resource-abuse.txt`
- `https://raw.githubusercontent.com/ghostery/adblocker/master/packages/adblocker/assets/ublock-origin/unbreak.txt`
- `https://raw.githubusercontent.com/ghostery/adblocker/master/packages/adblocker/assets/easylist/easyprivacy.txt`
- `https://raw.githubusercontent.com/ghostery/adblocker/master/packages/adblocker/assets/ublock-origin/privacy.txt`

## Build

```bash
node scripts/build-ghostery-youtube-rules.mjs
node scripts/build-ghostery-youtube-signals-rules.mjs
node scripts/build-ghostery-youtube-cosmetic-css.mjs
```

Output:

- `rules/ghostery-youtube-adtech.json`
- `rules/ghostery-youtube-signals.json`
- `rules/ghostery-youtube-cosmetic.css`

Notes:

- Current generated ruleset size: `1500`.
- Current generated signal rules size: `26`.
- Current generated cosmetic selectors: `16`.
- Rules are restricted to `initiatorDomains: ["youtube.com"]`.
- High-risk hosts (`*.googlevideo.com`, `*.ytimg.com`, `*.ggpht.com`, etc.) are excluded.
