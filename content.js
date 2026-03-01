(async () => {
    "use strict";

    const DEFAULT_FUNCTION_STATE = {};
    const DEFAULT_THEME = null;
    const DEFAULT_VIDEO_PLAY_SPEED = 1;
    const DEFAULT_VIDEO_LOOP = false;
    const DEFAULT_VIDEO_RESUME_MAP = {};
    const DEFAULT_LANGUAGE = null;

    const generateCommunicationKey = () => {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    };

    const prepareConfig = (storageData) => {
        return {
            functionState: storageData.functionState ?? DEFAULT_FUNCTION_STATE,
            theme: storageData.theme ?? DEFAULT_THEME,
            videoPlaySpeed: storageData.videoPlaySpeed ?? DEFAULT_VIDEO_PLAY_SPEED,
            videoLoop: storageData.videoLoop ?? DEFAULT_VIDEO_LOOP,
            videoResumeMap: storageData.videoResumeMap ?? DEFAULT_VIDEO_RESUME_MAP,
            language: storageData.language ?? DEFAULT_LANGUAGE,
            enableYtcsiHack: false,
            communicationKey: generateCommunicationKey()
        };
    };

    const injectMainWorldScript = () => {
        const s = document.createElement("script");
        s.src = chrome.runtime.getURL("main-world-script.js");
        s.async = false;
        (document.documentElement || document.head).appendChild(s);
        console.debug("YTEnhancerPlugin content.js: main-world-script injected");
    };

    let storedCommunicationKey = null;

    try {
        const storageKeys = ["functionState", "theme", "videoPlaySpeed", "videoLoop", "videoResumeMap", "language"];
        let storageData = {};

        try {
            storageData = await chrome.storage.local.get(storageKeys);
        } catch (storageError) {
            console.debug("YTEnhancerPlugin content.js: storage read failed, using defaults", storageError);
        }

        const CONFIG = prepareConfig(storageData);
        storedCommunicationKey = CONFIG.communicationKey;
        document.documentElement.dataset.extConfig = JSON.stringify(CONFIG);
        console.debug("YTEnhancerPlugin content.js: config prepared");

        injectMainWorldScript();
    } catch (error) {
        console.debug("YTEnhancerPlugin content.js: fatal error, injecting with defaults", error);

        const fallbackConfig = prepareConfig({});
        storedCommunicationKey = fallbackConfig.communicationKey;
        document.documentElement.dataset.extConfig = JSON.stringify(fallbackConfig);
        console.debug("YTEnhancerPlugin content.js: config prepared");

        injectMainWorldScript();
    }

    window.addEventListener("message", (event) => {
        if (event.source !== window) return;
        if (!event.data || event.data.source !== "YTEnhancerPlugin") return;
        if (event.data.type !== "SET_STORAGE") return;
        if (event.data.communicationKey !== storedCommunicationKey) return;

        const { key, value } = event.data;
        if (key == null || value === undefined) return;

        chrome.storage.local.set({ [key]: value }).catch((err) => {
            console.debug("YTEnhancerPlugin content.js: storage write failed", key, err);
        });
    }, false);
})();
