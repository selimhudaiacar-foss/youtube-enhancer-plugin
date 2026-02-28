# GPL/CC filter sources used for aggressive YouTube mode

## Sources

1. uAssets `uBlock filters`  
   URL: `https://ublockorigin.github.io/uAssets/filters/filters.min.txt`  
   License: GPL-3.0  
   Project: `https://github.com/uBlockOrigin/uAssets`

2. EasyList  
   URL: `https://easylist.to/easylist/easylist.txt`  
   License: GPL-3.0 or CC BY-SA 3.0 (dual)  
   License page: `https://easylist.to/pages/licence.html`

3. EasyPrivacy  
   URL: `https://easylist.to/easylist/easyprivacy.txt`  
   License: GPL-3.0 or CC BY-SA 3.0 (dual)  
   License page: `https://easylist.to/pages/licence.html`

## Build

```bash
node scripts/build-gpl-youtube-rules.mjs
```

Output:

- `rules/gpl-youtube-adtech.json`

Notes:

- Current generated ruleset size: `1800`.
- Rules are limited to `initiatorDomains: ["youtube.com"]`.
- High-risk hosts (`*.googlevideo.com`, `*.ytimg.com`, `*.ggpht.com`, etc.) are excluded.
