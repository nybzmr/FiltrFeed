const DEFAULT_POINTS = "10:00";

const updateButton = document.querySelector(".update");
const aboutMeInput = document.querySelector("#aboutMe");
const geminiApiKeyInput = document.querySelector("#geminiApiKey");
const pointsElement = document.querySelector("#pointsTime");
const usePointsButton = document.querySelector("#usePoints");
const statusElement = document.querySelector("#status");

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function setStatus(message, isError = false) {
  if (!statusElement) return;

  statusElement.textContent = message;
  statusElement.classList.toggle("error", isError);

  window.clearTimeout(setStatus.timeoutId);
  setStatus.timeoutId = window.setTimeout(() => {
    statusElement.textContent = "";
  }, 3000);
}

async function loadState() {
  const data = await chrome.storage.local.get([
    "aboutMe",
    "geminiApiKey",
    "points",
    "resting",
    "breakEndAt"
  ]);

  aboutMeInput.value =
    typeof data.aboutMe === "string" ? data.aboutMe : "";

  geminiApiKeyInput.value =
    typeof data.geminiApiKey === "string" ? data.geminiApiKey : "";

  if (data.resting && Number.isFinite(data.breakEndAt)) {
    pointsElement.textContent = formatDuration(data.breakEndAt - Date.now());
    usePointsButton.textContent = "End Break";
  } else {
    pointsElement.textContent =
      typeof data.points === "string" ? data.points : DEFAULT_POINTS;
    usePointsButton.textContent = "Use Points";
  }
}

updateButton.addEventListener("click", async (event) => {
  event.preventDefault();

  try {
    await chrome.storage.local.set({
      aboutMe: aboutMeInput.value.trim(),
      geminiApiKey: geminiApiKeyInput.value.trim()
    });

    setStatus("Saved.");
  } catch (error) {
    console.error(error);
    setStatus("Could not save settings.", true);
  }
});

usePointsButton.addEventListener("click", async () => {
  try {
    const { points, resting, breakEndAt } = await chrome.storage.local.get([
      "points",
      "resting",
      "breakEndAt"
    ]);

    if (resting) {
      const response = await chrome.runtime.sendMessage({
        type: "STOP_BREAK"
      });

      if (!response?.ok) {
        throw new Error(response?.error || "Could not end break.");
      }

      await chrome.storage.local.set({
        resting: false,
        breakEndAt: null
      });

      usePointsButton.textContent = "Use Points";
      setStatus("Break ended.");
      await notifyActiveYouTubeTab("STOP_BREAK");
      return;
    }

    const duration = typeof points === "string" ? points : DEFAULT_POINTS;

    if (!/^\d{1,3}:\d{2}$/.test(duration)) {
      throw new Error("Invalid focus-point time.");
    }

    const response = await chrome.runtime.sendMessage({
      type: "START_BREAK",
      payload: duration
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not start break.");
    }

    usePointsButton.textContent = "End Break";
    setStatus("Break started.");
    await notifyActiveYouTubeTab("START_BREAK");
  } catch (error) {
    console.error(error);
    setStatus(error instanceof Error ? error.message : String(error), true);
  }
});

async function notifyActiveYouTubeTab(type) {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab?.id || !tab.url?.includes("youtube.com")) {
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, { type });
  } catch (_) {
    // There may be no content-script instance on the active page yet.
  }
}

async function updateTimeFromStorage() {
  try {
    const data = await chrome.storage.local.get([
      "points",
      "resting",
      "breakEndAt"
    ]);

    if (data.resting && Number.isFinite(data.breakEndAt)) {
      pointsElement.textContent = formatDuration(
        data.breakEndAt - Date.now()
      );

      usePointsButton.textContent = "End Break";
      return;
    }

    pointsElement.textContent =
      typeof data.points === "string" ? data.points : DEFAULT_POINTS;
    usePointsButton.textContent = "Use Points";
  } catch (error) {
    console.error("Could not update timer:", error);
  }
}

window.setInterval(updateTimeFromStorage, 500);
loadState().catch((error) => {
  console.error("Could not load settings:", error);
  setStatus("Could not load settings.", true);
});
