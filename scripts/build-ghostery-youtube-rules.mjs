import fs from "node:fs/promises";
import path from "node:path";

const PREFIX = "https://raw.githubusercontent.com/ghostery/adblocker/master/packages/adblocker/assets";
const SOURCES = [
  `${PREFIX}/easylist/easylist.txt`,
  `${PREFIX}/peter-lowe/serverlist.txt`,
  `${PREFIX}/ublock-origin/badware.txt`,
  `${PREFIX}/ublock-origin/filters-2020.txt`,
  `${PREFIX}/ublock-origin/filters-2021.txt`,
  `${PREFIX}/ublock-origin/filters-2022.txt`,
  `${PREFIX}/ublock-origin/filters-2023.txt`,
  `${PREFIX}/ublock-origin/filters-2024.txt`,
  `${PREFIX}/ublock-origin/filters.txt`,
  `${PREFIX}/ublock-origin/quick-fixes.txt`,
  `${PREFIX}/ublock-origin/resource-abuse.txt`,
  `${PREFIX}/ublock-origin/unbreak.txt`,
  `${PREFIX}/easylist/easyprivacy.txt`,
  `${PREFIX}/ublock-origin/privacy.txt`
];

const OUTPUT_FILE = path.resolve(process.cwd(), "rules/ghostery-youtube-adtech.json");
const RULE_LIMIT = 1500;

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

function normalizeHost(host) {
  const trimmed = host.trim().toLowerCase().replace(/\.$/, "");
  if (!trimmed || !trimmed.includes(".")) return null;
  if (!/^[a-z0-9.-]+$/.test(trimmed)) return null;
  return trimmed;
}

function parseAbpHostRule(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("!") || trimmed.startsWith("#")) return null;
  if (trimmed.startsWith("@@")) return null;
  if (trimmed.includes("##") || trimmed.includes("#@#") || trimmed.includes("#$#") || trimmed.includes("#?#")) return null;
  if (!trimmed.startsWith("||")) return null;

  const pattern = trimmed.split("$")[0].trim();
  let host = pattern.slice(2).split("^")[0].split("/")[0];
  if (!host || host.includes("*")) return null;
  return normalizeHost(host);
}

function parseHostsFileLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("!") || trimmed.startsWith("#")) return null;
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return null;
  if (!/^(?:0\.0\.0\.0|127\.0\.0\.1|::1)$/.test(parts[0])) return null;
  return normalizeHost(parts[1]);
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
    const text = await fetchText(source);
    for (const line of text.split(/\r?\n/)) {
      const parsedHost = parseAbpHostRule(line) ?? parseHostsFileLine(line);
      if (!parsedHost) continue;
      if (isExcludedHost(parsedHost)) continue;
      if (!SIGNAL_REGEX.test(parsedHost)) continue;

      const nextScore = scoreHost(parsedHost);
      const prevScore = scoredHosts.get(parsedHost) ?? -Infinity;
      if (nextScore > prevScore) {
        scoredHosts.set(parsedHost, nextScore);
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
  console.log(`Generated ${rules.length} Ghostery-derived YouTube adtech rules -> ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
