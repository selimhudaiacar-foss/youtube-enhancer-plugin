# Third-Party Notices

This project includes/generated artifacts derived from third-party filter lists.

## Included source families

1. GoodbyeAds YouTube list  
   - Project: https://github.com/jerryn70/GoodbyeAds  
   - License: MIT

2. uAssets / uBlock Origin filters  
   - Project: https://github.com/uBlockOrigin/uAssets  
   - License: GPL-3.0

3. EasyList / EasyPrivacy  
   - Project: https://easylist.to/  
   - License: GPL-3.0 or CC BY-SA 3.0 (dual)

4. Ghostery adblocker asset bundle references  
   - Project: https://github.com/ghostery/adblocker  
   - License: MPL-2.0 (library code), with list sources as referenced in docs

## Project-level licensing note

Because this repository ships GPL-derived generated rules (for example
`rules/gpl-youtube-adtech.json`), the project is released as `GPL-3.0-only`.

## Regeneration scripts

Rules are generated via:

- `scripts/build-mit-youtube-rules.mjs`
- `scripts/build-gpl-youtube-rules.mjs`
- `scripts/build-ghostery-youtube-rules.mjs`
- `scripts/build-ghostery-youtube-signals-rules.mjs`
- `scripts/build-ghostery-youtube-cosmetic-css.mjs`

See documentation:

- `docs/mit-filter-sources.md`
- `docs/gpl-filter-sources.md`
- `docs/ghostery-derived-rules.md`
