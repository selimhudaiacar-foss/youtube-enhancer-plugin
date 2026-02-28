# YouTube Layout Enhancer

YouTube watch-page layout enhancer with:

- tabbed comments/info/videos layout tools
- bilingual popup UI (`English` / `Turkce`)
- playback resume + autoplay
- aggressive YouTube-focused ad filtering (DNR + in-page sanitization)

## Project Status

- Current status: `beta` (`v0.x` quality expectations)
- Suitable for GitHub release and community testing
- Not Chrome Web Store-ready yet (policy-sensitive ad blocking behaviors)

## Installation (Unpacked)

1. Open `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select the project folder (`yt-layout-ext`)

## Main Features

- Modern popup settings UI
- Feature toggles that sync instantly
- Optional page refresh behavior on toggle changes
- Resume videos from last watched second
- Auto-play after resume restore
- YouTube-specific ad filtering layers:
  - static `declarativeNetRequest` rulesets
  - JSON response ad-key pruning
  - DOM cosmetic ad cleanup
  - anti-interruption overlay neutralization

## Hard-Patch Debug Switch

For debugging site breakages, you can disable the most aggressive anti-interruption patches:

```js
localStorage.setItem("yt-layout-ext:disable-hard-patches", "1");
location.reload();
```

Re-enable:

```js
localStorage.removeItem("yt-layout-ext:disable-hard-patches");
location.reload();
```

## Build / Regenerate Rules

```bash
node scripts/build-mit-youtube-rules.mjs
node scripts/build-gpl-youtube-rules.mjs
node scripts/build-ghostery-youtube-rules.mjs
node scripts/build-ghostery-youtube-signals-rules.mjs
node scripts/build-ghostery-youtube-cosmetic-css.mjs
```

## Documentation

- MIT source notes: `docs/mit-filter-sources.md`
- GPL/CC source notes: `docs/gpl-filter-sources.md`
- Ghostery-derived notes: `docs/ghostery-derived-rules.md`
- GitHub overview doc: `docs/GITHUB_OVERVIEW_EN.md`
- Test checklist: `docs/TEST_CHECKLIST.md`
- Third-party notices: `NOTICE.md`

## License

This repository is distributed under `GPL-3.0-only` (see `LICENSE`).

Some generated rules derive from third-party lists with their own licenses.  
See `NOTICE.md` and the `docs/*-filter-sources.md` files for details.
