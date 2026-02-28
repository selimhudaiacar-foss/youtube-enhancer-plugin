const STORAGE_KEYS = ["functionState", "theme", "videoPlaySpeed", "videoLoop", "language"];

const DEFAULT_FUNCTION_STATE = {
  isOpenCommentTable: true,
  isOpenThemeProgressBar: true,
  isOpenSpeedControl: true,
  isOpenMarkOrRemoveAd: true,
  isOpenYoutubedownloading: true,
  isOpenResumeAutoplay: true
};

const STRINGS = {
  en: {
    popup_title: "YouTube Layout Enhancer",
    popup_subtitle: "Settings apply instantly.",
    section_features: "Feature Toggles",
    section_playback_theme: "Playback & Theme",
    feature_layout_optimization: "Layout optimization",
    feature_progress_bar_styling: "Progress bar styling",
    feature_speed_control: "Speed control",
    feature_resume_autoplay: "Resume + autoplay",
    feature_ad_labels: "Ad blocking",
    feature_youtube_downloading: "YouTube downloading",
    setting_language: "Language",
    setting_theme: "Theme",
    setting_default_speed: "Default speed",
    setting_loop: "Loop",
    language_en: "English",
    language_tr: "Turkish",
    theme_system: "System",
    theme_light: "Light",
    theme_dark: "Dark",
    saved_applying: "Saved, applying...",
    load_failed: "Could not load settings"
  },
  tr: {
    popup_title: "YouTube Yerleşim Geliştirici",
    popup_subtitle: "Ayarlar anında uygulanır.",
    section_features: "Özellik Anahtarları",
    section_playback_theme: "Oynatma ve Tema",
    feature_layout_optimization: "Yerleşim optimizasyonu",
    feature_progress_bar_styling: "İlerleme çubuğu stili",
    feature_speed_control: "Hız kontrolü",
    feature_resume_autoplay: "Kaldığın yer + otomatik oynat",
    feature_ad_labels: "Reklam engelleme",
    feature_youtube_downloading: "YouTube indirme",
    setting_language: "Dil",
    setting_theme: "Tema",
    setting_default_speed: "Varsayılan hız",
    setting_loop: "Döngü",
    language_en: "İngilizce",
    language_tr: "Türkçe",
    theme_system: "Sistem",
    theme_light: "Açık",
    theme_dark: "Koyu",
    saved_applying: "Kaydedildi, uygulanıyor...",
    load_failed: "Ayarlar yüklenemedi"
  }
};

const state = {
  functionState: { ...DEFAULT_FUNCTION_STATE },
  theme: null,
  videoPlaySpeed: 1,
  videoLoop: false,
  language: "en"
};

const elements = {
  isOpenCommentTable: document.getElementById("isOpenCommentTable"),
  isOpenThemeProgressBar: document.getElementById("isOpenThemeProgressBar"),
  isOpenSpeedControl: document.getElementById("isOpenSpeedControl"),
  isOpenResumeAutoplay: document.getElementById("isOpenResumeAutoplay"),
  isOpenMarkOrRemoveAd: document.getElementById("isOpenMarkOrRemoveAd"),
  isOpenYoutubedownloading: document.getElementById("isOpenYoutubedownloading"),
  language: document.getElementById("language"),
  theme: document.getElementById("theme"),
  videoPlaySpeed: document.getElementById("videoPlaySpeed"),
  videoLoop: document.getElementById("videoLoop"),
  saved: document.getElementById("saved")
};

let saveTimerId = null;
let reloadTimerId = null;

function normalizeLanguage(value) {
  if (value === "tr" || value === "en") return value;
  const browserLang = String(navigator.language || "en").slice(0, 2).toLowerCase();
  return browserLang === "tr" ? "tr" : "en";
}

function t(key) {
  const lang = STRINGS[state.language] || STRINGS.en;
  return lang[key] || STRINGS.en[key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    element.textContent = t(key);
  });
  document.title = t("popup_title");
  document.documentElement.lang = state.language;
}

function showSaved() {
  elements.saved.textContent = t("saved_applying");
  if (saveTimerId) {
    clearTimeout(saveTimerId);
  }
  saveTimerId = setTimeout(() => {
    elements.saved.textContent = "";
  }, 1200);
}

function normalizeFunctionState(raw) {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_FUNCTION_STATE };
  }
  return {
    ...DEFAULT_FUNCTION_STATE,
    ...raw
  };
}

function render() {
  elements.isOpenCommentTable.checked = !!state.functionState.isOpenCommentTable;
  elements.isOpenThemeProgressBar.checked = !!state.functionState.isOpenThemeProgressBar;
  elements.isOpenSpeedControl.checked = !!state.functionState.isOpenSpeedControl;
  elements.isOpenResumeAutoplay.checked = !!state.functionState.isOpenResumeAutoplay;
  elements.isOpenMarkOrRemoveAd.checked = !!state.functionState.isOpenMarkOrRemoveAd;
  elements.isOpenYoutubedownloading.checked = !!state.functionState.isOpenYoutubedownloading;
  elements.language.value = state.language;
  elements.theme.value = state.theme || "";
  elements.videoPlaySpeed.value = String(state.videoPlaySpeed || 1);
  elements.videoLoop.checked = !!state.videoLoop;
  applyTranslations();
}

function scheduleActiveTabReload() {
  if (reloadTimerId) {
    clearTimeout(reloadTimerId);
  }
  reloadTimerId = setTimeout(async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      if (!activeTab || activeTab.id == null) return;
      if (typeof activeTab.url === "string" && !/https?:\/\/([^.]+\.)?youtube\.com\//.test(activeTab.url)) {
        return;
      }
      await chrome.tabs.reload(activeTab.id);
    } catch (error) {
      console.error("Popup reload failed", error);
    }
  }, 120);
}

async function saveAndApply(payload) {
  await chrome.storage.local.set(payload);
  showSaved();
  scheduleActiveTabReload();
}

async function load() {
  const data = await chrome.storage.local.get(STORAGE_KEYS);

  state.functionState = normalizeFunctionState(data.functionState);
  state.theme = data.theme ?? null;
  state.videoPlaySpeed = Number(data.videoPlaySpeed ?? 1);
  state.videoLoop = !!data.videoLoop;
  state.language = normalizeLanguage(data.language);

  render();
}

async function updateFunctionState(patch) {
  state.functionState = {
    ...state.functionState,
    ...patch
  };
  await saveAndApply({ functionState: state.functionState });
}

function bind() {
  elements.isOpenCommentTable.addEventListener("change", (event) => {
    updateFunctionState({ isOpenCommentTable: event.target.checked });
  });

  elements.isOpenThemeProgressBar.addEventListener("change", (event) => {
    updateFunctionState({ isOpenThemeProgressBar: event.target.checked });
  });

  elements.isOpenSpeedControl.addEventListener("change", (event) => {
    updateFunctionState({ isOpenSpeedControl: event.target.checked });
  });

  elements.isOpenResumeAutoplay.addEventListener("change", (event) => {
    updateFunctionState({ isOpenResumeAutoplay: event.target.checked });
  });

  elements.isOpenMarkOrRemoveAd.addEventListener("change", (event) => {
    updateFunctionState({ isOpenMarkOrRemoveAd: event.target.checked });
  });

  elements.isOpenYoutubedownloading.addEventListener("change", (event) => {
    updateFunctionState({ isOpenYoutubedownloading: event.target.checked });
  });

  elements.language.addEventListener("change", async (event) => {
    const value = normalizeLanguage(event.target.value);
    state.language = value;
    render();
    await saveAndApply({ language: value });
  });

  elements.theme.addEventListener("change", async (event) => {
    const value = event.target.value || null;
    state.theme = value;
    await saveAndApply({ theme: value });
  });

  elements.videoPlaySpeed.addEventListener("change", async (event) => {
    const speed = Number(event.target.value || 1);
    state.videoPlaySpeed = speed;
    await saveAndApply({ videoPlaySpeed: speed });
  });

  elements.videoLoop.addEventListener("change", async (event) => {
    const value = event.target.checked;
    state.videoLoop = value;
    await saveAndApply({ videoLoop: value });
  });
}

bind();
load().catch((error) => {
  console.error("Popup initialization failed", error);
  const fallbackLang = normalizeLanguage(null);
  elements.saved.textContent = (STRINGS[fallbackLang] || STRINGS.en).load_failed;
});
