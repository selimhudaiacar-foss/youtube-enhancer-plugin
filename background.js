const RULESET_IDS = [
  "youtube_ads",
  "mit_goodbyeads_youtube",
  "gpl_youtube_adtech",
  "ghostery_youtube_adtech",
  "ghostery_youtube_signals"
];

function isAdBlockEnabled(functionState) {
  if (!functionState || typeof functionState !== "object") return true;
  return functionState.isOpenMarkOrRemoveAd !== false;
}

async function setRulesetEnabled(enabled) {
  const enabledRulesets = await chrome.declarativeNetRequest.getEnabledRulesets();
  const currentlyEnabled = new Set(enabledRulesets);
  const toEnable = [];
  const toDisable = [];

  for (const rulesetId of RULESET_IDS) {
    const hasEnabled = currentlyEnabled.has(rulesetId);
    if (enabled && !hasEnabled) toEnable.push(rulesetId);
    if (!enabled && hasEnabled) toDisable.push(rulesetId);
  }

  if (!toEnable.length && !toDisable.length) return;

  await chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: toEnable,
    disableRulesetIds: toDisable
  });
}

async function syncRulesetFromStorage() {
  try {
    const data = await chrome.storage.local.get(["functionState"]);
    const enabled = isAdBlockEnabled(data.functionState);
    await setRulesetEnabled(enabled);
    console.debug("YTLayoutExt background: ad ruleset sync", enabled);
  } catch (error) {
    console.error("YTLayoutExt background: failed to sync ruleset", error);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  syncRulesetFromStorage();
});

chrome.runtime.onStartup.addListener(() => {
  syncRulesetFromStorage();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes.functionState) return;
  const nextFunctionState = changes.functionState.newValue;
  const enabled = isAdBlockEnabled(nextFunctionState);
  setRulesetEnabled(enabled).catch((error) => {
    console.error("YTLayoutExt background: storage change sync failed", error);
  });
});

syncRulesetFromStorage();
