import fs from "node:fs/promises";
import path from "node:path";

const SOURCE_URL =
  "https://raw.githubusercontent.com/jerryn70/GoodbyeAds/master/Formats/GoodbyeAds-YouTube-AdBlock-Filter.txt";
const OUTPUT_FILE = path.resolve(process.cwd(), "rules/mit-goodbyeads-youtube.json");

const ALLOWED_SUFFIXES = [
  "doubleclick.net",
  "doubleclick.de",
  "googlesyndication.com",
  "googleadservices.com",
  "2mdn.net",
  "fwmrm.net",
  "innovid.com",
  "moatads.com",
  "adsafeprotected.com",
  "adform.net",
  "fastclick.net",
  "serving-sys.com",
  "tubemogul.com",
  "googletagservices.com"
];

const ALLOWED_EXACT = new Set([
  "adservice.google",
  "googleadapis.l.google.com",
  "ad.youtube.com",
  "ads.youtube.com"
]);

const IGNORE_SUFFIXES = [
  "googlevideo.com",
  "youtube-nocookie.com",
  "ytimg.com",
  "ggpht.com"
];

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

function hasIgnoredSuffix(host) {
  return IGNORE_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}

function hasAllowedSuffix(host) {
  return ALLOWED_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}

function parseHost(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("!")) return null;
  if (!trimmed.startsWith("||")) return null;

  const rawHost = trimmed.slice(2).split("$")[0].split("^")[0].split("/")[0].toLowerCase().trim();
  if (!rawHost) return null;
  if (!/^[a-z0-9.-]+$/.test(rawHost)) return null;
  if (!rawHost.includes(".")) return null;
  return rawHost;
}

async function fetchSource(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Source fetch failed: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function buildRulesFromSource(content) {
  const hostSet = new Set();
  for (const line of content.split(/\r?\n/)) {
    const host = parseHost(line);
    if (!host) continue;
    if (hasIgnoredSuffix(host)) continue;
    if (!ALLOWED_EXACT.has(host) && !hasAllowedSuffix(host)) continue;
    hostSet.add(host);
  }

  const hosts = [...hostSet].sort();
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
  const source = await fetchSource(SOURCE_URL);
  const rules = buildRulesFromSource(source);
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(rules, null, 2)}\n`, "utf8");
  console.log(`Generated ${rules.length} MIT YouTube rules -> ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
