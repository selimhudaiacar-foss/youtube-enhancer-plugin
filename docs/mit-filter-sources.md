# MIT filter sources used in this extension

## GoodbyeAds YouTube list

- Source URL:
  `https://raw.githubusercontent.com/jerryn70/GoodbyeAds/master/Formats/GoodbyeAds-YouTube-AdBlock-Filter.txt`
- Project: `https://github.com/jerryn70/GoodbyeAds`
- License: MIT
- License file:
  `https://raw.githubusercontent.com/jerryn70/GoodbyeAds/master/LICENSE`

## How to rebuild local rules

Run:

```bash
node scripts/build-mit-youtube-rules.mjs
```

This updates:

- `rules/mit-goodbyeads-youtube.json`

Notes:

- Only a YouTube-safe subset is imported from the source list.
- Potentially breaking hosts like `*.googlevideo.com`, `*.ytimg.com`, `*.ggpht.com`,
  and `*.youtube-nocookie.com` are excluded on purpose.
- Current generated ruleset size: `80` network rules.
