// ======================================================
// ICON-STELLAR - SVG ICON LIBRARY (STABLE + SMART VERSION)
// ======================================================

(function () {

  // ==================================================
  // 🔹 AUTO DETECT VERSION FROM SCRIPT SRC
  // ==================================================
  function getVersionFromScript() {
    const scripts = document.querySelectorAll("script");

    for (let script of scripts) {
      if (script.src && script.src.includes("icon-stellar")) {
        const match = script.src.match(/@([^/]+)/);
        if (match && match[1]) {
          return match[1]; // e.g. v1.5.0
        }
      }
    }

    return "latest"; // fallback
  }

  // ==================================================
  // 🔹 BASE CDN PATH
  // ==================================================
  const VERSION = getVersionFromScript();
  const BASE = `https://cdn.jsdelivr.net/gh/ART-TECH-FUZION/icon-stellar@${VERSION}/sprites`;

  // ==================================================
  // 🔹 MEMORY TRACK (avoid duplicate loads)
  // ==================================================
  const loadedSprites = new Set();

  // ==================================================
  // 🔹 LOCAL STORAGE CACHE
  // ==================================================
  function getCacheKey(spriteFile) {
    return `icon-stellar-${VERSION}-${spriteFile}`;
  }

  function saveToCache(key, data) {
    try {
      localStorage.setItem(key, data);
    } catch (e) {
      console.warn("⚠️ Cache full");
    }
  }

  function getFromCache(key) {
    return localStorage.getItem(key);
  }

  // ==================================================
  // 🔹 LOAD SPRITE (ASYNC + SAFE)
  // ==================================================
  async function loadSprite(spriteFile) {

    // ✅ Already loaded
    if (loadedSprites.has(spriteFile)) return;

    const cacheKey = getCacheKey(spriteFile);

    // ==================================================
    // 🔹 STEP 1: Try local cache
    // ==================================================
    const cached = getFromCache(cacheKey);

    if (cached) {
      injectSprite(cached, spriteFile);
      loadedSprites.add(spriteFile);
      return;
    }

    // ==================================================
    // 🔹 STEP 2: Fetch from CDN
    // ==================================================
    const url = `${BASE}/${spriteFile}`;

    try {
      console.log("🚀 Loading sprite:", url);

      const res = await fetch(url);

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.text();

      if (!data.includes("<svg")) {
        throw new Error("Invalid SVG");
      }

      // Save cache
      saveToCache(cacheKey, data);

      // Inject
      injectSprite(data, spriteFile);

      loadedSprites.add(spriteFile);

      console.log("✅ Sprite loaded:", spriteFile);

    } catch (err) {

      console.warn("⚠️ Version failed, fallback → latest");

      // ==================================================
      // 🔹 STEP 3: Fallback to latest
      // ==================================================
      try {
        const fallbackUrl = `https://cdn.jsdelivr.net/gh/ART-TECH-FUZION/icon-stellar@latest/sprites/${spriteFile}`;

        const res = await fetch(fallbackUrl);

        if (!res.ok) throw new Error("Fallback failed");

        const data = await res.text();

        injectSprite(data, spriteFile);

        loadedSprites.add(spriteFile);

      } catch (e) {
        console.error("❌ Sprite load failed:", spriteFile, e);
      }
    }
  }

  // ==================================================
  // 🔹 INJECT SVG INTO DOM
  // ==================================================
  function injectSprite(data, spriteFile) {

    // ❌ Prevent duplicate injection
    if (document.querySelector(`[data-sprite="${spriteFile}"]`)) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(data, "image/svg+xml");

    const svg = doc.querySelector("svg");

    if (!svg) {
      console.error("❌ SVG parse failed");
      return;
    }

    svg.style.display = "none";
    svg.setAttribute("data-sprite", spriteFile);

    // 🔥 Wait for body ready (Elementor safe)
    const inject = () => {
      if (document.body) {
        document.body.insertAdjacentElement("afterbegin", svg);
      } else {
        requestAnimationFrame(inject);
      }
    };

    inject();
  }

  // ==================================================
  // 🔹 DEFAULT ICON STYLE
  // ==================================================
  function injectDefaultStyles() {

    if (document.getElementById("icon-stellar-style")) return;

    const style = document.createElement("style");
    style.id = "icon-stellar-style";

    style.innerHTML = `
      .is-icon {
        width: 1em;
        height: 1em;
        fill: currentColor;
        display: inline-block;
        vertical-align: middle;
      }
    `;

    document.head.appendChild(style);
  }

  // ==================================================
  // 🔹 CREATE SVG ELEMENT
  // ==================================================
  function createSVG(iconId) {

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");

    use.setAttribute("href", `#${iconId}`);

    svg.appendChild(use);
    svg.classList.add("is-icon");

    return svg;
  }

  // ==================================================
  // 🔹 RENDER ICONS
  // ==================================================
  async function renderIcons() {

    console.log("⚡ Rendering icons...");

    const elements = document.querySelectorAll("[data-icon]");

    for (const el of elements) {

      const value = el.getAttribute("data-icon");

      if (!value || !value.includes(":")) continue;

      const parts = value.split(":");

      const category = parts[0];
      const name = parts[1];
      const variant = parts[2] || "regular";

      const spriteFile = `${category}.svg`;
      const iconId = `${name}-${variant}`;

      // 🔥 Wait for sprite load
      await loadSprite(spriteFile);

      const svg = createSVG(iconId);

      el.innerHTML = "";
      el.appendChild(svg);
    }
  }

  // ==================================================
  // 🔹 INIT (Elementor SAFE)
  // ==================================================
  function init() {
    injectDefaultStyles();
    renderIcons();
  }

  // 🔥 Important: wait full load (Elementor fix)
  window.addEventListener("load", () => {
    setTimeout(init, 300);
  });

})();