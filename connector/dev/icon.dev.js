/**
 * ============================================================================
 * ICON-STELLAR - SVG ICON LIBRARY (PRODUCTION STRICT VERSION)
 * ============================================================================
 * Handles fetching, caching, and injecting SVG sprites from a CDN.
 * Dynamically detects version from the script tag source.
 * Strictly enforces the "category:name:variant" format and handles missing icons.
 * Completely silent in the console for production environments.
 */

(function () {
  "use strict";

  /**
   * ============================================================================
   * VERSION DETECTION
   * ============================================================================
   * Scans script tags to find the Icon-Stellar script and extracts its version.
   * Fallback to 'latest' if no specific version is found.
   */
  function getVersionFromScript() {
    const scripts = document.querySelectorAll("script");
    for (let script of scripts) {
      // Make it case-insensitive to avoid matching errors
      if (script.src && script.src.toLowerCase().includes("icon-stellar")) {
        const match = script.src.match(/@([^/]+)/);
        if (match && match[1]) {
          return match[1]; // e.g., returns '1.5.0' or 'main'
        }
      }
    }
    return "latest"; // Fallback version
  }

  const VERSION = getVersionFromScript();
  const BASE_URL = `https://cdn.jsdelivr.net/gh/art-tech-fuzion/icon-stellar@${VERSION}/sprites`;
  
  // Track loaded sprites and active network requests to prevent duplicates
  const loadedSprites = new Set();
  const activeFetches = new Map();

  /**
   * ============================================================================
   * DOM INJECTION
   * ============================================================================
   */
  function injectSprite(svgData, spriteFile) {
    if (document.querySelector(`svg[data-sprite="${spriteFile}"]`)) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgData, "image/svg+xml");
    const svgNode = doc.querySelector("svg");

    if (!svgNode) return;

    svgNode.setAttribute("data-sprite", spriteFile);
    svgNode.style.cssText = "position: absolute; width: 0; height: 0; overflow: hidden;";
    svgNode.setAttribute("aria-hidden", "true");

    const inject = () => {
      if (document.body) {
        document.body.insertAdjacentElement("afterbegin", svgNode);
      } else {
        requestAnimationFrame(inject);
      }
    };
    inject();
  }

  /**
   * ============================================================================
   * NETWORK FETCHING
   * ============================================================================
   */
  async function loadSprite(spriteFile) {
    if (loadedSprites.has(spriteFile)) return true;

    if (activeFetches.has(spriteFile)) {
      return await activeFetches.get(spriteFile);
    }

    const fetchPromise = (async () => {
      try {
        const url = `${BASE_URL}/${spriteFile}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error("Network error");
        
        const data = await response.text();
        if (!data.includes("<svg")) throw new Error("Invalid SVG");

        injectSprite(data, spriteFile);
        loadedSprites.add(spriteFile);
        return true;

      } catch (error) {
        // Silently fail
        return false;
      }
    })();

    activeFetches.set(spriteFile, fetchPromise);
    const success = await fetchPromise;
    activeFetches.delete(spriteFile);

    return success;
  }

  /**
   * ============================================================================
   * STYLING
   * ============================================================================
   */
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
      .icon-missing {
        font-size: 1em;
        display: inline-block;
        vertical-align: middle;
        font-family: sans-serif;
        color: inherit;
        opacity: 0.7;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * ============================================================================
   * ELEMENT CREATION
   * ============================================================================
   */
  function createSVGElement(iconId) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    
    use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${iconId}`);
    use.setAttribute("href", `#${iconId}`);
    
    svg.appendChild(use);
    svg.classList.add("is-icon");
    return svg;
  }

  /**
   * ============================================================================
   * RENDERING LOGIC
   * ============================================================================
   */
  async function renderIcons(rootElement = document) {
    const elements = rootElement.querySelectorAll("[data-icon]:not([data-icon-rendered])");

    for (const el of elements) {
      const value = el.getAttribute("data-icon");
      if (!value) continue;

      el.setAttribute("data-icon-rendered", "true");

      const parts = value.split(":");
      
      // STRICT RULE: Requires category, name, and variant
      if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
        el.innerHTML = `<span class="icon-missing" title="Invalid format">☒</span>`;
        continue;
      }

      const category = parts[0];
      const name = parts[1];
      const variant = parts[2];

      const spriteFile = `${category}.svg`;
      const iconId = `${name}-${variant}`;

      const isSpriteLoaded = await loadSprite(spriteFile);

      // Show missing box if file not found OR ID doesn't exist in SVG
      if (!isSpriteLoaded || !document.getElementById(iconId)) {
        el.innerHTML = `<span class="icon-missing" title="Icon not found">☒</span>`;
        continue;
      }

      const svg = createSVGElement(iconId);
      el.innerHTML = "";
      el.appendChild(svg);
    }
  }

  /**
   * ============================================================================
   * DYNAMIC DOM OBSERVATION
   * ============================================================================
   */
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

  /**
   * ============================================================================
   * INITIALIZATION BOOTSTRAP
   * ============================================================================
   */
  function init() {
    injectDefaultStyles();
    renderIcons();
    observeDOMChanges();
    setTimeout(() => renderIcons(), 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();