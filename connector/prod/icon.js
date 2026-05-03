// ======================================================
// ICON-STELLAR - ULTIMATE FIX VERSION (NO CACHE)
// ======================================================

(function () {
  "use strict";

  console.log("🔥 Icon-Stellar Ultimate Fix Script Loaded!");

  const BASE_URL = `https://cdn.jsdelivr.net/gh/ART-TECH-FUZION/icon-stellar@latest/sprites`;
  
  const loadedSprites = new Set();
  const activeFetches = new Map();

  // ==================================================
  // INJECT SVG INTO DOM
  // ==================================================
  function injectSprite(svgData, spriteFile) {
    if (document.querySelector(`svg[data-sprite="${spriteFile}"]`)) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgData, "image/svg+xml");
    const svgNode = doc.querySelector("svg");

    if (!svgNode) {
      console.error(`❌ Icon-Stellar: Invalid SVG format in ${spriteFile}`);
      return;
    }

    svgNode.setAttribute("data-sprite", spriteFile);
    svgNode.style.cssText = "position: absolute; width: 0; height: 0; overflow: hidden;";
    svgNode.setAttribute("aria-hidden", "true");

    const inject = () => {
      if (document.body) {
        document.body.insertAdjacentElement("afterbegin", svgNode);
        console.log(`✅ Sprite Injected: ${spriteFile}`);
      } else {
        requestAnimationFrame(inject);
      }
    };
    inject();
  }

  // ==================================================
  // LOAD SPRITE FILE (WITH LIVE CACHE BUSTER)
  // ==================================================
  async function loadSprite(spriteFile) {
    if (loadedSprites.has(spriteFile)) return;
    if (activeFetches.has(spriteFile)) {
      await activeFetches.get(spriteFile);
      return;
    }

    const fetchPromise = (async () => {
      try {
        // ?t= timestamp forces the CDN to fetch the absolute latest file from GitHub
        const liveUrl = `${BASE_URL}/${spriteFile}?t=${new Date().getTime()}`;
        console.log(`🌐 Fetching SVG: ${liveUrl}`);
        
        const res = await fetch(liveUrl);
        if (!res.ok) throw new Error("Fetch failed");
        
        const data = await res.text();
        if (!data.includes("<svg")) throw new Error("Not a valid SVG");

        injectSprite(data, spriteFile);
        loadedSprites.add(spriteFile);
      } catch (error) {
        console.error(`❌ Failed to load sprite ${spriteFile}`, error);
      }
    })();

    activeFetches.set(spriteFile, fetchPromise);
    await fetchPromise;
    activeFetches.delete(spriteFile);
  }

  // ==================================================
  // DEFAULT STYLES
  // ==================================================
  function injectDefaultStyles() {
    if (document.getElementById("icon-stellar-styles")) return;

    const style = document.createElement("style");
    style.id = "icon-stellar-styles";
    style.innerHTML = `
      .is-icon {
        width: 1em;
        height: 1em;
        fill: currentColor;
        display: inline-block;
        vertical-align: middle;
      }
      .icon-error {
        background: red;
        color: white;
        padding: 2px 5px;
        font-size: 12px;
        border-radius: 4px;
        font-family: sans-serif;
      }
    `;
    document.head.appendChild(style);
  }

  // ==================================================
  // CREATE LOCAL SVG ELEMENT (CROSS-BROWSER FIX)
  // ==================================================
  function createSVGElement(iconId) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    
    // Support for both old Safari and modern browsers
    use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${iconId}`);
    use.setAttribute("href", `#${iconId}`);
    
    svg.appendChild(use);
    svg.classList.add("is-icon");
    return svg;
  }

  // ==================================================
  // RENDER ICONS ON PAGE
  // ==================================================
  async function renderIcons(rootElement = document) {
    const elements = rootElement.querySelectorAll("[data-icon]:not([data-icon-rendered])");

    for (const el of elements) {
      const value = el.getAttribute("data-icon");
      if (!value) continue;

      el.setAttribute("data-icon-rendered", "true");

      const parts = value.split(":");
      let category, name, variant;

      // Logic to auto-fix user mistakes (e.g., typing all:facebook instead of all:facebook:solid)
      if (parts.length === 2) {
        category = parts[0];
        name = parts[1];
        variant = "solid"; // Auto fallback so the icon at least shows up
      } else if (parts.length >= 3) {
        category = parts[0];
        name = parts[1];
        variant = parts[2];
      } else {
        el.innerHTML = `<span class="icon-error">Invalid format</span>`;
        continue;
      }

      const spriteFile = `${category}.svg`;
      const iconId = `${name}-${variant}`;

      console.log(`⚙️ Generating Icon: ${iconId}`);

      await loadSprite(spriteFile);

      const svg = createSVGElement(iconId);
      el.innerHTML = "";
      el.appendChild(svg);
    }
  }

  // ==================================================
  // OBSERVE DYNAMIC DOM CHANGES
  // ==================================================
  function observeDOMChanges() {
    const observer = new MutationObserver((mutations) => {
      let shouldRender = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldRender = true;
          break;
        }
      }
      if (shouldRender) {
        setTimeout(() => renderIcons(), 50);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ==================================================
  // INITIALIZATION
  // ==================================================
  function init() {
    injectDefaultStyles();
    renderIcons();
    observeDOMChanges();

    // Secondary scan for slow builders like Elementor
    setTimeout(() => renderIcons(), 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();