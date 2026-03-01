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

    const toRuntimeConfigPayload = (config) => ({
        functionState: config.functionState,
        theme: config.theme,
        videoPlaySpeed: config.videoPlaySpeed,
        videoLoop: config.videoLoop,
        videoResumeMap: config.videoResumeMap,
        language: config.language
    });

    const injectMainWorldScript = () => {
        const s = document.createElement("script");
        s.src = chrome.runtime.getURL("main-world-script.js");
        s.async = false;
        (document.documentElement || document.head).appendChild(s);
        console.debug("YTEnhancerPlugin content.js: main-world-script injected");
    };

    let storedCommunicationKey = null;
    const bootstrapConfig = prepareConfig({});
    storedCommunicationKey = bootstrapConfig.communicationKey;
    document.documentElement.dataset.extConfig = JSON.stringify(bootstrapConfig);
    console.debug("YTEnhancerPlugin content.js: bootstrap config prepared");
    injectMainWorldScript();

    const syncConfigToMainWorld = (payload) => {
        const send = () => {
            window.postMessage({
                source: "YTEnhancerPluginContent",
                type: "SYNC_CONFIG",
                communicationKey: storedCommunicationKey,
                config: payload
            }, "*");
        };

        send();
        setTimeout(send, 80);
        setTimeout(send, 240);
    };

    try {
        const storageKeys = ["functionState", "theme", "videoPlaySpeed", "videoLoop", "videoResumeMap", "language"];
        const storageData = await chrome.storage.local.get(storageKeys);
        const liveConfig = prepareConfig(storageData);
        liveConfig.communicationKey = storedCommunicationKey;
        console.debug("YTEnhancerPlugin content.js: storage config prepared");
        syncConfigToMainWorld(toRuntimeConfigPayload(liveConfig));
    } catch (storageError) {
        console.debug("YTEnhancerPlugin content.js: storage read failed, keeping bootstrap defaults", storageError);
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
