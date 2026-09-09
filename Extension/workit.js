(() => {
  "use strict";

  const HOME_URL = "https://www.youtube.com/";
  const DEFAULT_USER_CONTEXT =
    "A student interested in understanding the world and improving skills. Prefers conceptual videos. Not interested in lifestyle vlogs, general entertainment, or drama.";
  const HOME_BATCH_SIZE = 15;
  const RETRY_DELAY_MS = 700;
  const MUTATION_DEBOUNCE_MS = 350;

  const FALLBACK_VIDEOS = [
    ["But what is a Neural Network? | Deep learning, chapter 1", "https://www.youtube.com/watch?v=aircAruvnKk", "AI, Neural Networks", "3Blue1Brown"],
    ["Machine Learning Crash Course for Beginners", "https://www.youtube.com/watch?v=Gv9_4yMHFhI", "AI, ML", "Daniel Bourke"],
    ["How Machines Learn", "https://www.youtube.com/watch?v=R9OHn5ZF4Uo", "AI, Machine Learning", "CGP Grey"],
    ["Gradient Descent, Step-by-Step", "https://www.youtube.com/watch?v=sDv4f4s2SB8", "AI, Optimization", "StatQuest"],
    ["Convolutional Neural Networks explained", "https://www.youtube.com/watch?v=YRhxdVk_sIs", "AI, Deep Learning", "deeplizard"],
    ["Competitive Programming Tips and Tricks", "https://www.youtube.com/watch?v=fgWbQkLk1TU", "CP, Tips", "William Lin"],
    ["Dynamic Programming - Learn to Solve DP Problems", "https://www.youtube.com/watch?v=oBt53YbR9Kk", "CP, DP", "NeetCode"],
    ["Binary Search Explained", "https://www.youtube.com/watch?v=s4DPM8ct1pI", "CP, Binary Search", "Errichto"],
    ["How to Start Competitive Programming?", "https://www.youtube.com/watch?v=2MaCrn38X0Y", "CP, Beginner", "Errichto"],
    ["Bit Manipulation Full Course", "https://www.youtube.com/watch?v=0SmmjeoG708", "CP, Bitwise", "take U forward"],
    ["Learn Python - Full Course for Beginners", "https://www.youtube.com/watch?v=rfscVS0vtbw", "Python, Beginner", "freeCodeCamp"],
    ["Python in 100 Seconds", "https://www.youtube.com/watch?v=x7X9w_GIm1s", "Python, Quick", "Fireship"],
    ["Object Oriented Programming in Python", "https://www.youtube.com/watch?v=Ej_02ICOIgs", "Python, OOP", "freeCodeCamp"],
    ["Python Lambda Functions Explained", "https://www.youtube.com/watch?v=hYzwCsKGRrg", "Python, Functions", "Tech With Tim"],
    ["Recursion Explained - Data Structures and Algorithms", "https://www.youtube.com/watch?v=IJDJ0kBx2LM", "DSA, Recursion", "Abdul Bari"],
    ["The Essence of Linear Algebra", "https://www.youtube.com/watch?v=fNk_zzaMoSs", "Math, Linear Algebra", "3Blue1Brown"],
    ["Essence of Calculus", "https://www.youtube.com/watch?v=WUvTyaaNkzM", "Math, Calculus", "3Blue1Brown"],
    ["Fourier Transform Explained", "https://www.youtube.com/watch?v=spUNpyF58BY", "Math, Signal Processing", "3Blue1Brown"],
    ["Probability Explained", "https://www.youtube.com/watch?v=KzfWUEJjG18", "Math, Probability", "Veritasium"],
    ["Understanding Eigenvectors and Eigenvalues", "https://www.youtube.com/watch?v=PFDu9oVAE-g", "Math, Algebra", "Zach Star"],
    ["What is Quantum Entanglement?", "https://www.youtube.com/watch?v=ZuvK-od647c", "Physics, Quantum", "MinutePhysics"],
    ["What is a Neutrino?", "https://www.youtube.com/watch?v=I-6-p3bChpQ", "Physics, Particle", "Fermilab"],
    ["General Relativity Explained Simply", "https://www.youtube.com/watch?v=AwhKZ3fd9JA", "Physics, Relativity", "PBS Space Time"],
    ["Why is Light Speed the Limit?", "https://www.youtube.com/watch?v=VSxX5MEV5SU", "Physics, Conceptual", "PBS Space Time"],
    ["Quantum Mechanics in 5 Minutes", "https://www.youtube.com/watch?v=p7bzE1E5PMY", "Physics, Quantum", "Kurzgesagt"],
    ["How the Internet Works", "https://www.youtube.com/watch?v=TNQsmPf24go", "CS, Internet", "Code.org"],
    ["Operating Systems: Crash Course", "https://www.youtube.com/watch?v=26QPDBe-NB8", "CS, OS", "CrashCourse"],
    ["What is an API?", "https://www.youtube.com/watch?v=s7wmiS2mSXY", "CS, API", "MuleSoft"],
    ["How Computers Calculate - ALU", "https://www.youtube.com/watch?v=1I5ZMmrOfnA", "CS, Computer Architecture", "Ben Eater"],
    ["How Memory Works", "https://www.youtube.com/watch?v=xf7wT1fjtxQ", "CS, Memory", "Ben Eater"],
    ["The Most Efficient Way to Study", "https://www.youtube.com/watch?v=CPxSzxylRCI", "Study Tips, Neuroscience", "Thomas Frank"],
    ["DNA vs RNA", "https://www.youtube.com/watch?v=4PKjF7OumYo", "Biology, Genetics", "Amoeba Sisters"],
    ["What is CRISPR?", "https://www.youtube.com/watch?v=MnYppmstxIs", "Biotech, Genetic Engineering", "Kurzgesagt"],
    ["How to Learn Anything Fast - 5 Tips", "https://www.youtube.com/watch?v=UNP03fDSj1U", "Learning, Productivity", "Thomas Frank"],
    ["Active Recall vs Passive Review", "https://www.youtube.com/watch?v=Z-zNHHpXoMM", "Study, Techniques", "Ali Abdaal"]
  ];

  const HOME_CARD_SELECTORS = [
    "ytd-rich-item-renderer",
    "ytd-rich-grid-media",
    "ytd-video-renderer",
    "ytd-grid-video-renderer",
    "yt-lockup-view-model",
    "ytd-compact-video-renderer",
    'ytd-rich-item-renderer[lockup="true"]'
  ];

  let active = true;
  let currentUrl = location.href;
  let navigationToken = 0;
  let homeProcessing = false;
  let watchProcessing = false;
  let homeTimer = null;
  let watchTimer = null;
  let mutationTimer = null;
  let watchProcessedTitle = "";
  let fallbackInjected = false;

  console.log("[FiltrFeed] loaded", location.href);

  function pageType() {
    try {
      const url = new URL(location.href);
      if (url.hostname !== "youtube.com" && !url.hostname.endsWith(".youtube.com")) return "other";
      if (url.pathname.startsWith("/shorts/")) return "shorts";
      if (url.pathname === "/watch" && url.searchParams.get("v")) return "watch";
      if (url.pathname === "/" || url.pathname === "") return "home";
      return "other";
    } catch {
      return "other";
    }
  }

  function isContextInvalidated(error) {
    return String(error?.message || error).toLowerCase().includes("extension context invalidated");
  }

  function setFilterClass(enabled) {
    document.documentElement?.classList.toggle("filtrfeed-active", enabled);
  }

  async function updateActiveState() {
    try {
      const { resting } = await chrome.storage.local.get("resting");
      active = !Boolean(resting);
      setFilterClass(active);
      return active;
    } catch (error) {
      if (isContextInvalidated(error)) {
        active = false;
        setFilterClass(false);
        return false;
      }
      throw error;
    }
  }

  async function getUserContext() {
    try {
      const { aboutMe } = await chrome.storage.local.get("aboutMe");
      return typeof aboutMe === "string" && aboutMe.trim() ? aboutMe.trim() : DEFAULT_USER_CONTEXT;
    } catch (error) {
      if (isContextInvalidated(error)) {
        active = false;
        return DEFAULT_USER_CONTEXT;
      }
      throw error;
    }
  }

  function hideElement(element) {
    if (!(element instanceof HTMLElement)) return;
    if (!element.dataset.filtrfeedOriginalDisplay) {
      element.dataset.filtrfeedOriginalDisplay = element.style.display || "";
    }
    element.classList.add("filtrfeed-hidden");
    element.style.setProperty("display", "none", "important");
  }

  function showElement(element) {
    if (!(element instanceof HTMLElement)) return;
    if (!element.classList.contains("filtrfeed-hidden")) return;
    const original = element.dataset.filtrfeedOriginalDisplay || "";
    element.classList.remove("filtrfeed-hidden");
    element.style.display = original;
    delete element.dataset.filtrfeedOriginalDisplay;
  }

  function restoreOwnHidden() {
    document.querySelectorAll(".filtrfeed-hidden").forEach(showElement);
    document.querySelectorAll("[data-filtrfeed-processed]").forEach((el) => delete el.dataset.filtrfeedProcessed);
    fallbackInjected = false;
    document.querySelector(".filtrfeed-fallback-container")?.remove();
  }

  function textOf(element) {
    return element?.textContent?.replace(/\s+/g, " ").trim() || "";
  }

  function isShortsLink(link) {
    try {
      return new URL(link.href, location.origin).pathname.startsWith("/shorts/");
    } catch {
      return false;
    }
  }

  function containsShortsLink(element) {
    return Array.from(element.querySelectorAll('a[href]')).some(isShortsLink);
  }

  function hideShorts() {
    if (!active) return;

    // Known Shorts shelves.
    const knownShelves = document.querySelectorAll(
      "ytd-reel-shelf-renderer, ytd-shorts, ytd-shorts-shelf-renderer"
    );
    knownShelves.forEach(hideElement);

    // Newer YouTube builds sometimes wrap Shorts in a generic rich shelf/section.
    document.querySelectorAll("ytd-rich-shelf-renderer, ytd-rich-section-renderer").forEach((element) => {
      const label = textOf(element).split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 4).join(" ").toLowerCase();
      if (label.includes("shorts") || containsShortsLink(element)) hideElement(element);
    });

    // If YouTube exposes individual Shorts cards directly, hide their nearest card.
    document.querySelectorAll('a[href*="/shorts/"]').forEach((link) => {
      let card = link.closest(
        "ytd-rich-item-renderer, ytd-rich-grid-media, ytd-video-renderer, ytd-grid-video-renderer, yt-lockup-view-model, ytd-compact-video-renderer"
      );
      if (!card) card = link.parentElement;
      if (card) hideElement(card);
    });

    // Hide the Shorts entry in the side navigation.
    document.querySelectorAll(
      'ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, a[title], a[aria-label]'
    ).forEach((element) => {
      const label = (element.getAttribute("aria-label") || element.getAttribute("title") || textOf(element)).trim().toLowerCase();
      if (label === "shorts") hideElement(element);
    });
  }

  function getVideoIdFromHref(href) {
    try {
      const url = new URL(href, location.origin);
      const value = url.searchParams.get("v");
      return value && /^[A-Za-z0-9_-]{11}$/.test(value) ? value : null;
    } catch {
      return null;
    }
  }

  function isAdCard(element) {
    if (element.querySelector("ytd-ad-slot-renderer, ytd-promoted-sparkles-web-renderer, ytd-display-ad-renderer")) return true;
    const text = textOf(element).toLowerCase();
    return /(^|\s)sponsored(\s|$)/i.test(text) || /\bad\b/.test(text) && Boolean(element.querySelector("a[href]"));
  }

  function findCardForWatchLink(link) {
    return link.closest(
      "ytd-rich-item-renderer, ytd-rich-grid-media, ytd-video-renderer, ytd-grid-video-renderer, yt-lockup-view-model, ytd-compact-video-renderer"
    );
  }

  function getHomeCards() {
    const cards = [];
    const seen = new Set();

    const addCard = (card) => {
      if (!(card instanceof Element) || seen.has(card)) return;
      if (card.dataset.filtrfeedFallback === "true") return;
      if (card.closest("ytd-reel-shelf-renderer, ytd-rich-shelf-renderer:has(.shortsLockupViewModelHost), ytd-rich-section-renderer:has(.shortsLockupViewModelHost)")) return;
      if (card.matches("ytm-shorts-lockup-view-model") || card.querySelector("ytm-shorts-lockup-view-model, .shortsLockupViewModelHost")) return;
      if (isAdCard(card)) return;

      const title = getCardTitle(card);
      const link = getCardLink(card);
      if (!title || !link) return;

      seen.add(card);
      cards.push(card);
    };

    // Current desktop Home feed: ytd-rich-item-renderer[lockup=true] -> yt-lockup-view-model.
    document.querySelectorAll('ytd-rich-item-renderer[lockup="true"], ytd-rich-item-renderer').forEach(addCard);

    // Compatibility with older/newer renderer variants.
    document.querySelectorAll("ytd-rich-grid-media, ytd-video-renderer, ytd-grid-video-renderer, yt-lockup-view-model").forEach((element) => {
      const richItemParent = element.closest("ytd-rich-item-renderer");
      addCard(richItemParent || element);
    });

    // Last-resort route: start from actual /watch links and locate their card container.
    document.querySelectorAll('a[href*="/watch?v="]').forEach((link) => {
      addCard(findCardForWatchLink(link));
    });

    return cards;
  }

  function getCardTitle(card) {
    const selectors = [
      "#video-title",
      "#video-title-link",
      "a.yt-lockup-metadata-view-model__title",
      ".yt-lockup-metadata-view-model__title",
      ".yt-lockup-metadata-view-model-wiz__title",
      ".ytLockupMetadataViewModelTitle",
      "yt-lockup-metadata-view-model a[href*='/watch?v=']",
      "h3 a",
      "a[aria-label][href*='/watch?v=']",
      "a[href*='/watch?v=']"
    ];

    for (const selector of selectors) {
      const element = card.querySelector(selector);
      const text = textOf(element);
      if (text) return text;
    }
    return "";
  }

  function getCardLink(card) {
    const links = card.querySelectorAll('a[href*="/watch"], a[href*="youtu.be/"]');
    for (const link of links) {
      const href = new URL(link.href, location.origin).href;
      if (getVideoIdFromHref(href)) return href;
    }
    return null;
  }

  function fallbackContainer() {
    let container = document.querySelector(".filtrfeed-fallback-container");
    if (container) return container;

    const parent = document.querySelector("ytd-rich-grid-renderer #contents, ytd-rich-grid-renderer, #contents");
    if (!parent) return null;

    container = document.createElement("section");
    container.className = "filtrfeed-fallback-container";
    container.setAttribute("aria-label", "FiltrFeed educational recommendations");
    parent.appendChild(container);
    return container;
  }

  function injectFallbackVideos(count) {
    if (count <= 0 || fallbackInjected) return;
    const container = fallbackContainer();
    if (!container) return;

    const used = new Set();
    const limit = Math.min(count, FALLBACK_VIDEOS.length);

    for (let i = 0; i < FALLBACK_VIDEOS.length && used.size < limit; i++) {
      const [title, link, tags, creator] = FALLBACK_VIDEOS[i];
      if (used.has(link)) continue;
      used.add(link);

      const id = getVideoIdFromHref(link);
      if (!id) continue;

      const card = document.createElement("article");
      card.className = "ytBox";
      card.dataset.filtrfeedFallback = "true";
      card.tabIndex = 0;

      card.innerHTML = `
        <div class="thumbnail"><img src="https://i3.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy"></div>
        <div class="details">
          <div class="title"></div>
          <div class="tags"></div>
        </div>`;

      card.querySelector(".title").textContent = title;
      card.querySelector(".tags").textContent = `${tags} · ${creator}`;
      card.addEventListener("click", () => { location.href = link; });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          location.href = link;
        }
      });
      container.appendChild(card);
    }

    fallbackInjected = true;
  }

  async function classifyTitles(titles, token) {
    if (!titles.length) return [];

    const userContext = await getUserContext();
    if (!active || token !== navigationToken) return null;

    try {
      const response = await chrome.runtime.sendMessage({
        type: "CLASSIFY_TITLES",
        userContext,
        titles
      });

      if (!active || token !== navigationToken) return null;
      if (!response?.ok) throw new Error(response?.error || "Classifier request failed.");

      if (
        !Array.isArray(response.result) ||
        response.result.length !== titles.length ||
        response.result.some((value) => typeof value !== "boolean")
      ) {
        throw new Error(`Classifier returned ${response?.result?.length ?? 0} results for ${titles.length} titles.`);
      }

      return response.result;
    } catch (error) {
      if (isContextInvalidated(error)) {
        active = false;
        setFilterClass(false);
        return null;
      }
      throw error;
    }
  }

  async function processHome() {
    if (!active || pageType() !== "home" || homeProcessing) return;

    hideShorts();

    const cards = getHomeCards();
    console.log(`[FiltrFeed] home cards found: ${cards.length} (rich items: ${document.querySelectorAll("ytd-rich-item-renderer").length}, watch links: ${document.querySelectorAll('a[href*="/watch"]').length})`);
    if (!cards.length) {
      console.debug("[FiltrFeed] No usable cards yet. Sample title selectors:", {
        lockups: document.querySelectorAll("yt-lockup-view-model").length,
        newTitles: document.querySelectorAll(".yt-lockup-metadata-view-model__title, .yt-lockup-metadata-view-model-wiz__title, .ytLockupMetadataViewModelTitle").length
      });
      return;
    }

    const pending = cards
      .filter((card) => card.dataset.filtrfeedProcessed !== "true")
      .slice(0, HOME_BATCH_SIZE);

    if (!pending.length) {
      const visibleCount = cards.filter((card) => !card.classList.contains("filtrfeed-hidden")).length;
      if (visibleCount < 6) injectFallbackVideos(6 - visibleCount);
      return;
    }

    homeProcessing = true;
    const token = navigationToken;

    try {
      const titles = pending.map(getCardTitle);
      console.log(`[FiltrFeed] classifying ${titles.length} titles`);
      const results = await classifyTitles(titles, token);
      if (!results) return;

      for (let i = 0; i < pending.length; i++) {
        const card = pending[i];
        card.dataset.filtrfeedProcessed = "true";

        if (results[i] !== true) {
          hideElement(card);
          console.log("[FiltrFeed] removed:", titles[i]);
        }
      }

      const visibleCount = getHomeCards().filter((card) => !card.classList.contains("filtrfeed-hidden")).length;
      if (visibleCount < 6) injectFallbackVideos(6 - visibleCount);
    } catch (error) {
      console.error("[FiltrFeed] home classification failed:", error);
    } finally {
      homeProcessing = false;
    }
  }

  async function processWatch() {
    if (!active || pageType() !== "watch" || watchProcessing) return;

    const titleElement = document.querySelector(
      "ytd-watch-metadata h1 yt-formatted-string, ytd-watch-metadata h1, h1.ytd-watch-metadata"
    );
    const currentTitle = textOf(titleElement);
    if (!currentTitle || currentTitle === watchProcessedTitle) return;

    const sideEntries = [];
    const seen = new Set();
    document.querySelectorAll("ytd-compact-video-renderer").forEach((card) => {
      if (seen.has(card) || isAdCard(card)) return;
      const title = textOf(card.querySelector("#video-title, yt-formatted-string#video-title, span.ytd-compact-video-renderer"));
      if (!title) return;
      seen.add(card);
      sideEntries.push({ card, title });
    });

    hideShorts();

    const titles = sideEntries.map((entry) => entry.title);
    titles.push(currentTitle);

    watchProcessing = true;
    const token = navigationToken;

    try {
      console.log(`[FiltrFeed] classifying watch page: ${titles.length} titles`);
      const results = await classifyTitles(titles, token);
      if (!results) return;

      watchProcessedTitle = currentTitle;

      if (results[results.length - 1] !== true) {
        console.log("[FiltrFeed] current video rejected:", currentTitle);
        location.replace(HOME_URL);
        return;
      }

      for (let i = 0; i < sideEntries.length; i++) {
        sideEntries[i].card.dataset.filtrfeedProcessed = "true";
        if (results[i] !== true) {
          hideElement(sideEntries[i].card);
          console.log("[FiltrFeed] removed:", sideEntries[i].title);
        }
      }
    } catch (error) {
      console.error("[FiltrFeed] watch classification failed:", error);
    } finally {
      watchProcessing = false;
    }
  }

  function scheduleHome() {
    if (homeTimer || pageType() !== "home" || !active) return;
    homeTimer = setTimeout(async () => {
      homeTimer = null;
      try {
        await updateActiveState();
        if (active) await processHome();
      } catch (error) {
        console.error("[FiltrFeed] home schedule failed:", error);
      }
    }, RETRY_DELAY_MS);
  }

  function scheduleWatch() {
    if (watchTimer || pageType() !== "watch" || !active) return;
    watchTimer = setTimeout(async () => {
      watchTimer = null;
      try {
        await updateActiveState();
        if (active) await processWatch();
      } catch (error) {
        console.error("[FiltrFeed] watch schedule failed:", error);
      }
    }, RETRY_DELAY_MS);
  }

  async function route(force = false) {
    const nextUrl = location.href;
    if (!force && nextUrl === currentUrl) return;

    currentUrl = nextUrl;
    navigationToken++;
    watchProcessedTitle = "";
    homeProcessing = false;
    watchProcessing = false;
    fallbackInjected = false;

    if (homeTimer) clearTimeout(homeTimer);
    if (watchTimer) clearTimeout(watchTimer);
    homeTimer = null;
    watchTimer = null;

    restoreOwnHidden();

    await updateActiveState();
    if (!active) return;

    const type = pageType();
    console.log("[FiltrFeed] navigation:", type, nextUrl);

    if (type === "shorts") {
      location.replace(HOME_URL);
      return;
    }

    hideShorts();
    if (type === "home") scheduleHome();
    if (type === "watch") scheduleWatch();
  }

  function queueCurrentPage() {
    if (!active) return;
    const type = pageType();

    if (type === "shorts") {
      location.replace(HOME_URL);
      return;
    }

    hideShorts();
    if (type === "home") scheduleHome();
    if (type === "watch") scheduleWatch();
  }

  async function applyBreakState(resting) {
    active = !Boolean(resting);
    navigationToken++;

    if (homeTimer) clearTimeout(homeTimer);
    if (watchTimer) clearTimeout(watchTimer);
    homeTimer = null;
    watchTimer = null;
    homeProcessing = false;
    watchProcessing = false;
    watchProcessedTitle = "";

    if (!active) {
      restoreOwnHidden();
      setFilterClass(false);
      console.log("[FiltrFeed] filtering disabled");
      return;
    }

    setFilterClass(true);
    restoreOwnHidden();
    console.log("[FiltrFeed] filtering enabled");
    queueCurrentPage();
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "START_BREAK") {
      applyBreakState(true).catch((error) => console.error("[FiltrFeed] break start failed:", error));
      sendResponse({ ok: true });
      return;
    }

    if (message?.type === "STOP_BREAK") {
      applyBreakState(false).catch((error) => console.error("[FiltrFeed] break stop failed:", error));
      sendResponse({ ok: true });
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.resting) {
      applyBreakState(changes.resting.newValue).catch((error) => console.error("[FiltrFeed] storage state failed:", error));
    }
  });

  function startObservers() {
    const observer = new MutationObserver(() => {
      if (mutationTimer) return;
      mutationTimer = setTimeout(() => {
        mutationTimer = null;
        if (location.href !== currentUrl) {
          route().catch((error) => console.error("[FiltrFeed] route failed:", error));
        } else {
          queueCurrentPage();
        }
      }, MUTATION_DEBOUNCE_MS);
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    document.addEventListener("yt-navigate-finish", () => {
      route(true).catch((error) => console.error("[FiltrFeed] yt-navigate-finish failed:", error));
    });

    document.addEventListener("yt-page-data-updated", () => {
      route(true).catch((error) => console.error("[FiltrFeed] yt-page-data-updated failed:", error));
    });
  }

  async function init() {
    if (pageType() === "other") return;

    setFilterClass(true);
    await updateActiveState();
    startObservers();

    if (!active) {
      setFilterClass(false);
      console.log("[FiltrFeed] currently on break");
      return;
    }

    queueCurrentPage();
  }

  init().catch((error) => console.error("[FiltrFeed] init failed:", error));
})();
