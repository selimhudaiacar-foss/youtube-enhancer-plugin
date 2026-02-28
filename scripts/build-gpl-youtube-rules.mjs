import fs from "node:fs/promises";
import path from "node:path";

const SOURCES = [
  {
    name: "uAssets filters",
    url: "https://ublockorigin.github.io/uAssets/filters/filters.min.txt"
  },
  {
    name: "EasyList",
    url: "https://easylist.to/easylist/easylist.txt"
  },
  {
    name: "EasyPrivacy",
    url: "https://easylist.to/easylist/easyprivacy.txt"
  }
];

const OUTPUT_FILE = path.resolve(process.cwd(), "rules/gpl-youtube-adtech.json");
const RULE_LIMIT = 1800;

const EXCLUDED_SUFFIXES = [
  "youtube.com",
  "googlevideo.com",
  "ytimg.com",
  "ggpht.com",
  "youtube-nocookie.com",
  "gstatic.com",
  "googleapis.com"
];

const HIGH_SIGNAL_TOKENS = [
  "doubleclick",
  "googlesyndication",
  "googleadservices",
  "googletagservices",
  "2mdn",
  "fwmrm",
  "innovid",
  "moatads",
  "adsafeprotected",
  "adform",
  "adnxs",
  "pubmatic",
  "rubicon",
  "openx",
  "taboola",
  "outbrain",
  "teads",
  "criteo",
  "adzerk",
  "smartadserver",
  "smaato",
  "spotx",
  "yieldmo",
  "revcontent",
  "adservice",
  "adserver",
  "adtech",
  "advertising"
];

const SIGNAL_REGEX = /ad|ads|sponsor|promo|pixel|track|doubleclick|googlesyndication|googleadservices|googletagservices|taboola|outbrain|criteo|adnxs|pubmatic|rubicon|openx|teads|moat|innovid|2mdn|fwmrm|quantcast|scorecardresearch|adform|smaato|spotx|smartadserver|adservice|adserver|revcontent|yieldmo/i;

const RESOURCE_TYPES = [
  "script",
  "xmlhttprequest",
  "sub_frame",
  "image",
  "media",
  "ping",
  "font",
  "stylesheet",
  "object",
  "websocket",
  "other"
];

function parseHostRule(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("!") || trimmed.startsWith("#")) return null;
  if (trimmed.startsWith("@@")) return null;
  if (trimmed.includes("##") || trimmed.includes("#@#") || trimmed.includes("#$#") || trimmed.includes("#?#")) return null;
  if (!trimmed.startsWith("||")) return null;

  const pattern = trimmed.split("$")[0].trim();
  let host = pattern.slice(2).split("^")[0].split("/")[0].trim().toLowerCase();
  if (!host) return null;
  if (host.endsWith(".")) host = host.slice(0, -1);
  if (!host || !host.includes(".")) return null;
  if (host.includes("*")) return null;
  if (!/^[a-z0-9.-]+$/.test(host)) return null;

  return host;
}

function isExcludedHost(host) {
  return EXCLUDED_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}

function scoreHost(host) {
  let score = 0;

  if (host.startsWith("ad.") || host.startsWith("ads.") || host.startsWith("ad-")) score += 25;
  if (host.startsWith("pixel.")) score += 15;

  for (const token of HIGH_SIGNAL_TOKENS) {
    if (host.includes(token)) score += 60;
  }

  if (host.includes("analytics") && !host.includes("ad")) score -= 30;
  if (host.includes("cdn") && !host.includes("ad")) score -= 5;

  if (host.length < 16) score += 8;

  return score;
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function buildHostPool() {
  const scoredHosts = new Map();

  for (const source of SOURCES) {
    const text = await fetchText(source.url);
    for (const line of text.split(/\r?\n/)) {
      const host = parseHostRule(line);
      if (!host) continue;
      if (isExcludedHost(host)) continue;
      if (!SIGNAL_REGEX.test(host)) continue;

      const nextScore = scoreHost(host);
      const prevScore = scoredHosts.get(host) ?? -Infinity;
      if (nextScore > prevScore) {
        scoredHosts.set(host, nextScore);
      }
    }
  }

  return [...scoredHosts.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      if (a[0].length !== b[0].length) return a[0].length - b[0].length;
      return a[0].localeCompare(b[0]);
    })
    .slice(0, RULE_LIMIT)
    .map(([host]) => host);
}

function toRules(hosts) {
  return hosts.map((host, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: `||${host}^`,
      initiatorDomains: ["youtube.com"],
      resourceTypes: RESOURCE_TYPES
    }
  }));
}

async function main() {
  const hosts = await buildHostPool();
  const rules = toRules(hosts);
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(rules, null, 2)}\n`, "utf8");
  console.log(`Generated ${rules.length} GPL YouTube adtech rules -> ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
