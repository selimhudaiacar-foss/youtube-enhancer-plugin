# YouTube Layout Enhancer: Comprehensive GitHub Overview

YouTube Layout Enhancer is a Chrome MV3 extension built to make YouTube faster, cleaner, and more controllable.

This project does more than visual tweaks. It combines layout optimization, playback controls, multilingual settings, ad cleanup, and anti-interruption resilience through a layered architecture.

## What It Solves

- Cluttered or inefficient YouTube watch-page layout
- Ad placements and leftover empty ad slots
- "Resume from last position" and autoplay continuity needs
- Fast access to frequently changed settings like speed/theme/loop
- Instant application of settings from a compact popup panel

## Key Features

### 1) Modern Popup Settings Panel

- Glass-inspired modern popup interface
- Fast open on extension icon click
- Settings save instantly
- Active YouTube tab auto-reloads to apply changes immediately

### 2) Bilingual UI (TR/EN)

- Language selector inside popup
- Turkish and English labels
- Persistent language preference

### 3) Playback Controls

- Default speed selection (`0.5x` to `3x`)
- In-player speed control button
- Loop toggle
- Automatic speed re-apply on video changes

### 4) Resume + Autoplay

- Per-video progress persistence
- Restore to last watched second on revisit
- Autoplay attempt after restore
- Near-end progress cleanup to avoid bad resume states

### 5) YouTube Layout Enhancements

- Tab-oriented watch-page optimization
- Extra toolbox utilities
- Practical player-level shortcuts

### 6) Toolbox Quick Actions

In-player quick tools include:

- Settings dialog
- Theme switch
- Screenshot capture
- Open video in a new playback tab
- Loop toggle
- External download flow shortcut

### 7) Multi-Layer Ad Blocking Engine

Instead of relying on a single approach, the extension combines:

1. `Declarative Net Request (DNR)` rulesets
2. JSON response ad-key pruning
3. DOM/cosmetic ad element cleanup
4. Home feed empty-slot compaction after ad removal
5. Anti-interruption / anti-adblock overlay neutralization

## Ad Engine Coverage

Current ruleset distribution:

- `rules/youtube-ads.json`: `10`
- `rules/mit-goodbyeads-youtube.json`: `80`
- `rules/gpl-youtube-adtech.json`: `1800`
- `rules/ghostery-youtube-adtech.json`: `1500`
- `rules/ghostery-youtube-signals.json`: `26`

Total DNR rules: `3416`  
Additional cosmetic selectors: `16` (`rules/ghostery-youtube-cosmetic.css`)

## Anti-Interruption Resilience

The extension includes dedicated defenses against YouTube interruption flows:

- Playability payload normalization
- Detection and removal/hiding of interruption overlays
- Playback recovery attempts when interruption UI blocks startup

## Hard-Patch Debug Switch

To temporarily disable aggressive anti-interruption patches:

```js
localStorage.setItem("yt-layout-ext:disable-hard-patches", "1");
location.reload();
```

To re-enable:

```js
localStorage.removeItem("yt-layout-ext:disable-hard-patches");
location.reload();
```

## Privacy and Permission Approach

Permissions are scoped to YouTube and related ad infrastructure domains.  
The extension does not require broad `<all_urls>` host access.

## Installation (GitHub / Unpacked)

1. Open `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select the `yt-layout-ext` folder

## Testing Scope

A manual checklist is included at:

- `docs/TEST_CHECKLIST.md`

It covers:

- Popup behavior
- Watch/shorts/home scenarios
- Resume + autoplay behavior
- Ad cleanup and regression checks

## License and Third-Party Notes

- Project license: `GPL-3.0-only`
- Third-party notices: `NOTICE.md`
- Filter source docs:
  - `docs/mit-filter-sources.md`
  - `docs/gpl-filter-sources.md`
  - `docs/ghostery-derived-rules.md`

## Short Roadmap

- Broader automated test coverage
- Stability metrics and error telemetry strategy
- Optional compatibility mode profiles
- Structured semantic versioning and release notes

## Summary

YouTube Layout Enhancer is not just a theme extension.  
It is a technical quality-of-life package that improves YouTube across layout, playback control, resume continuity, and ad cleanup.

It is suitable for GitHub distribution and community testing, and currently maintained at a `beta` maturity level.
