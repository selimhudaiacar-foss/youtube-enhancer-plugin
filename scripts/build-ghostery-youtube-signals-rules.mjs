import fs from "node:fs/promises";
import path from "node:path";

const PREFIX = "https://raw.githubusercontent.com/ghostery/adblocker/master/packages/adblocker/assets";
const SOURCES = [
  `${PREFIX}/easylist/easylist.txt`,
  `${PREFIX}/ublock-origin/quick-fixes.txt`,
  `${PREFIX}/ublock-origin/filters.txt`
];

const OUTPUT_FILE = path.resolve(process.cwd(), "rules/ghostery-youtube-signals.json");
const RULE_LIMIT = 1200;

const DEFAULT_RESOURCE_TYPES = [
  "xmlhttprequest",
  "script",
  "sub_frame",
  "image",
  "media",
  "ping",
  "other"
];

const TYPE_MAP = new Map([
  ["xmlhttprequest", "xmlhttprequest"],
  ["xhr", "xmlhttprequest"],
  ["script", "script"],
  ["subdocument", "sub_frame"],
  ["sub_frame", "sub_frame"],
  ["image", "image"],
  ["media", "media"],
  ["ping", "ping"],
  ["font", "font"],
  ["stylesheet", "stylesheet"],
  ["object", "object"],
  ["websocket", "websocket"],
  ["other", "other"]
]);

const YOUTUBE_DOMAIN_RE = /(^|\.)youtube\.com$|(^|\.)youtube-nocookie\.com$|(^|\.)youtubekids\.com$|(^|\.)youtubei\.googleapis\.com$/i;
const AD_SIGNAL_RE = /(ad_break|pagead|midroll|ptracking|adunit|doubleclick|googlesyndication|googleadservices|googleads|gampad|videoad|adformat|adslot|adservice|adtag)/i;
const UNSAFE_PATTERN_RE = /(\/watch\?[^$]*$|\/playlist\?list=[^$]*$|\/youtubei\/v1\/player\?[^$]*$|\/youtubei\/v1\/get_watch\?[^$]*$)/i;
const UNSUPPORTED_OPTION_RE = /(replace=|redirect=|removeparam=|csp=|rewrite=|permissions=|urlskip=|badfilter|redirect-rule=|queryprune=|denyallow=)/i;
const FALLBACK_PATTERNS = [
  "||youtube.com/pagead/",
  "||youtube.com/youtubei/v1/player/ad_break",
  "||youtube.com/api/stats/ads?",
  "||youtube.com/get_midroll_",
  "||m.youtube.com/get_midroll_",
  "||www.youtube.com/get_midroll_",
  "||youtube.com/ptracking?*ad",
  "||youtube.com/get_video_info?*adunit",
  "||youtube.com/get_video_info?*adformat",
  "||google.*/pagead/lvz?",
  "||googlesyndication.com/pagead/",
  "||pagead2.googlesyndication.com^"
];

function normalizeDomain(domain) {
  return domain.trim().toLowerCase().replace(/^\*\./, "").replace(/\.$/, "");
}

function isYouTubeDomain(domain) {
  return YOUTUBE_DOMAIN_RE.test(normalizeDomain(domain));
}

function extractHostFromPattern(pattern) {
  if (!pattern.startsWith("||")) return "";
  const withoutAnchors = pattern.slice(2);
  const hostPart = withoutAnchors.split("/")[0].split("^")[0].split("?")[0].trim().toLowerCase();
  return hostPart;
}

function isAllowedHost(host) {
  if (!host) return false;
  if (host === "google.*") return true;

  if (host === "youtube.com" || host.endsWith(".youtube.com")) return true;
  if (host === "youtube-nocookie.com" || host.endsWith(".youtube-nocookie.com")) return true;

  if (host === "doubleclick.net" || host.endsWith(".doubleclick.net")) return true;
  if (host === "doubleclick.com" || host.endsWith(".doubleclick.com")) return true;
  if (host === "googlesyndication.com" || host.endsWith(".googlesyndication.com")) return true;
  if (host === "googleadservices.com" || host.endsWith(".googleadservices.com")) return true;
  if (host === "googleads.g.doubleclick.net" || host.endsWith(".googleads.g.doubleclick.net")) return true;
  if (host === "g.doubleclick.net" || host.endsWith(".g.doubleclick.net")) return true;

  if (host === "google.com" || host.endsWith(".google.com")) return true;
  return false;
}

function parseRuleLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("!") || trimmed.startsWith("#")) return null;
  if (trimmed.startsWith("@@")) return null;
  if (trimmed.includes("##") || trimmed.includes("#@#")) return null;
  if (trimmed.startsWith("/") || trimmed.includes("##+js")) return null;
  if (!trimmed.startsWith("||")) return null;

  const [rawPattern, rawOptions = ""] = trimmed.split("$", 2);
  const pattern = rawPattern.trim();
  if (!pattern || pattern.length < 5) return null;
  const host = extractHostFromPattern(pattern);
  if (!isAllowedHost(host)) return null;
  if (!AD_SIGNAL_RE.test(pattern)) return null;
  if (UNSAFE_PATTERN_RE.test(pattern)) return null;
  if (pattern.includes("googlevideo.com/videoplayback")) return null;
  if (rawOptions && UNSUPPORTED_OPTION_RE.test(rawOptions)) return null;

  const options = rawOptions
    ? rawOptions
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
    : [];

  const includeDomains = [];
  const resourceTypes = new Set();

  for (const option of options) {
    if (option.startsWith("domain=")) {
      for (const part of option.slice("domain=".length).split("|")) {
        const token = part.trim();
        if (!token || token.startsWith("~")) continue;
        includeDomains.push(normalizeDomain(token));
      }
      continue;
    }

    if (option.startsWith("~")) continue;
    const mapped = TYPE_MAP.get(option);
    if (mapped) {
      resourceTypes.add(mapped);
    }
  }

  if (includeDomains.length > 0 && !includeDomains.some(isYouTubeDomain)) {
    return null;
  }

  const finalResourceTypes = resourceTypes.size > 0 ? Array.from(resourceTypes) : DEFAULT_RESOURCE_TYPES;
  finalResourceTypes.sort();
  return { pattern, resourceTypes: finalResourceTypes };
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function buildRuleInputs() {
  const unique = new Map();

  for (const source of SOURCES) {
    const text = await fetchText(source);
    for (const line of text.split(/\r?\n/)) {
      const parsed = parseRuleLine(line);
      if (!parsed) continue;
      const key = `${parsed.pattern}|${parsed.resourceTypes.join(",")}`;
      if (!unique.has(key)) unique.set(key, parsed);
    }
  }

  for (const pattern of FALLBACK_PATTERNS) {
    const key = `${pattern}|${DEFAULT_RESOURCE_TYPES.join(",")}`;
    if (!unique.has(key)) {
      unique.set(key, { pattern, resourceTypes: DEFAULT_RESOURCE_TYPES });
    }
  }

  // Keep URL patterns that most likely target ad delivery/tracking first.
  return [...unique.values()]
    .sort((a, b) => {
      const tokenWeight = (value) => {
        const p = value.pattern.toLowerCase();
        let score = 0;
        if (p.includes("ad_break")) score += 120;
        if (p.includes("midroll")) score += 110;
        if (p.includes("pagead")) score += 100;
        if (p.includes("ptracking")) score += 95;
        if (p.includes("doubleclick")) score += 90;
        if (p.includes("googlesyndication")) score += 85;
        if (p.includes("googleadservices")) score += 80;
        if (p.includes("adunit")) score += 70;
        return score;
      };
      const diff = tokenWeight(b) - tokenWeight(a);
      if (diff !== 0) return diff;
      return a.pattern.localeCompare(b.pattern);
    })
    .slice(0, RULE_LIMIT);
}

function toRules(inputs) {
  return inputs.map((entry, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: entry.pattern,
      initiatorDomains: ["youtube.com"],
      resourceTypes: entry.resourceTypes
    }
  }));
}

async function main() {
  const inputs = await buildRuleInputs();
  const rules = toRules(inputs);
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(rules, null, 2)}\n`, "utf8");
  console.log(`Generated ${rules.length} Ghostery signal rules -> ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
