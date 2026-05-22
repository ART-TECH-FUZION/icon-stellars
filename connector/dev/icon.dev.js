/**
 * ============================================================================
 * ICON-STELLAR - SVG ICON LIBRARY (SMART FALLBACK VERSION)
 * ============================================================================
 * A professional, lightweight library to fetch and inject SVG sprites.
 * Features:
 * - Dynamic version detection from script source.
 * - Automatic fallback to @latest if the specified version tag is missing.
 * - MutationObserver for dynamic content (Elementor/React compatible).
 * - Silent execution for production environments.
 */

(function () {
  "use strict";

  /**
   * ============================================================================
   * VERSION DETECTION
   * ============================================================================
   * Scans all <script> tags to find the Icon-Stellar loader and extracts
   * the version tag (e.g., @v1.0.0). Defaults to 'latest' if not found.
   */
  function getVersionFromScript() {
    const scripts = document.querySelectorAll("script");
    for (let script of scripts) {
      if (script.src && script.src.toLowerCase().includes("icon-stellar")) {
        const match = script.src.match(/@([^/]+)/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
    return "latest";
  }

  // Configuration Constants
  const DETECTED_VERSION = getVersionFromScript();
  const REPO_PATH = "art-tech-fuzion/icon-stellars";

  // URL Construction: Primary (from script tag) and Fallback (latest)
  const PRIMARY_BASE = `https://cdn.jsdelivr.net/gh/${REPO_PATH}@${DETECTED_VERSION}/sprites/prod`;
  const LATEST_BASE = `https://cdn.jsdelivr.net/gh/${REPO_PATH}@latest/sprites/prod`;

  // State tracking to prevent redundant network requests and duplicate injections
  const loadedSprites = new Set();
  const activeFetches = new Map();

  /**
   * ============================================================================
   * DOM INJECTION
   * ============================================================================
   * Parses the raw SVG string and injects it into the DOM as a hidden sprite.
   */
  function injectSprite(svgData, spriteFile) {
    if (document.querySelector(`svg[data-sprite="${spriteFile}"]`)) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgData, "image/svg+xml");
    const svgNode = doc.querySelector("svg");

    if (!svgNode) return;

    // Set identifier and hide visually without breaking <use> references
    svgNode.setAttribute("data-sprite", spriteFile);
    svgNode.style.cssText =
      "position: absolute; width: 0; height: 0; overflow: hidden;";
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
   * NETWORK FETCHING (WITH SMART FALLBACK)
   * ============================================================================
   * Attempts to fetch the sprite using the detected version. If it returns 404,
   * it retries using the @latest tag.
   */
  async function loadSprite(spriteFile) {
    if (loadedSprites.has(spriteFile)) return true;

    if (activeFetches.has(spriteFile)) {
      return await activeFetches.get(spriteFile);
    }

    const fetchPromise = (async () => {
      try {
        // Step 1: Attempt to load the specific version requested
        let response = await fetch(`${PRIMARY_BASE}/${spriteFile}`);

        // Step 2: Fallback to @latest if primary fails (404) and was not already @latest
        if (!response.ok && DETECTED_VERSION !== "latest") {
          response = await fetch(`${LATEST_BASE}/${spriteFile}`);
        }

        if (!response.ok)
          throw new Error("Resource not found on primary or latest");

        const data = await response.text();
        if (!data.includes("<svg")) throw new Error("Invalid SVG content");

        injectSprite(data, spriteFile);
        loadedSprites.add(spriteFile);
        return true;
      } catch (error) {
        return false; // Silent failure allows the missing icon placeholder to show
      }
    })();

    activeFetches.set(spriteFile, fetchPromise);
    const success = await fetchPromise;
    activeFetches.delete(spriteFile);

    return success;
  }

  /**
   * ============================================================================
   * STYLING & HELPERS
   * ============================================================================
   */

  // Inject basic CSS for icon sizing and error display
  function injectDefaultStyles() {
    if (document.getElementById("icon-stellar-styles")) return;
    const style = document.createElement("style");
    style.id = "icon-stellar-styles";
    style.innerHTML = `
      .is-icon { width: 1.1em; height: 1.1em; fill: currentColor; display: inline-flex; align-items: center; justify-content: center; vertical-align: middle; margin: 0 0.3rem;}
      .icon-missing { font-size: 1em; display: inline-block; vertical-align: middle; font-family: sans-serif; opacity: 0.7; }
    `;
    document.head.appendChild(style);
  }

  // Create the <svg><use></use></svg> element structure
  function createSVGElement(iconId) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");

    // Support for xlink:href (older browsers) and modern href
    use.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      `#${iconId}`,
    );
    use.setAttribute("href", `#${iconId}`);

    svg.appendChild(use);
    svg.classList.add("is-icon");
    return svg;
  }

  /**
   * ============================================================================
   * RENDERING ENGINE
   * ============================================================================
   * Finds elements with 'data-icon' and transforms them into SVG icons.
   */
  async function renderIcons(rootElement = document) {
    const elements = rootElement.querySelectorAll(
      "[data-icon]:not([data-icon-rendered])",
    );

    for (const el of elements) {
      const value = el.getAttribute("data-icon");
      if (!value) continue;

      el.setAttribute("data-icon-rendered", "true");

      const parts = value.split(":");

      // Validation: Format must be category:name:variant
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        el.innerHTML = `<span class="icon-missing" title="Invalid Format">☒</span>`;
        continue;
      }

      const category = parts[0];
      const iconId = parts[1];
      const spriteFile = `${category}.svg`;

      const isSpriteLoaded = await loadSprite(spriteFile);

      // Verify sprite loaded and the specific ID exists in the hidden SVG
      if (!isSpriteLoaded || !document.getElementById(iconId)) {
        el.innerHTML = `<span class="icon-missing" title="Icon Not Found">☒</span>`;
        continue;
      }

      const svg = createSVGElement(iconId);
      el.innerHTML = "";
      el.appendChild(svg);
    }
  }

  /**
   * ============================================================================
   * DOM OBSERVATION & INITIALIZATION
   * ============================================================================
   */

  // Watch for new elements added to the DOM (for Elementor AJAX or dynamic loaders)
  function observeDOMChanges() {
    const observer = new MutationObserver((mutations) => {
      let shouldRender = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldRender = true;
          break;
        }
      }
      if (shouldRender) setTimeout(() => renderIcons(), 50);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    injectDefaultStyles();
    renderIcons();
    observeDOMChanges();
    // Extra scan for slow-loading builders
    setTimeout(() => renderIcons(), 1500);
  }

  // Bootstrapping the application
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
