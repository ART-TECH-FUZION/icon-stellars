/**
 * ============================================================================
 * ICON-STELLAR - SVG ICON LIBRARY (PRODUCTION STRICT VERSION)
 * ============================================================================
 * Handles fetching, caching, and injecting SVG sprites from a CDN.
 * Strictly enforces the "category:name:variant" format and handles missing icons.
 */

(function () {
  "use strict";

  console.log("🔥 Icon-Stellar Script Initialized!");

  // Base URL for fetching SVG sprites from the main branch
  const BASE_URL = `https://cdn.jsdelivr.net/gh/art-tech-fuzion/icon-stellars@latest/sprites`;
  
  // Track loaded sprites and active network requests to prevent duplicates
  const loadedSprites = new Set();
  const activeFetches = new Map();

  /**
   * ============================================================================
   * DOM INJECTION
   * ============================================================================
   * Parses the raw SVG text and safely injects it into the top of the body tag.
   */
  function injectSprite(svgData, spriteFile) {
    // Prevent injecting the same sprite multiple times
    if (document.querySelector(`svg[data-sprite="${spriteFile}"]`)) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgData, "image/svg+xml");
    const svgNode = doc.querySelector("svg");

    if (!svgNode) {
      console.error(`Icon-Stellar: Invalid SVG format detected in ${spriteFile}`);
      return;
    }

    // Hide the injected sprite visually but keep it readable by the browser
    svgNode.setAttribute("data-sprite", spriteFile);
    svgNode.style.cssText = "position: absolute; width: 0; height: 0; overflow: hidden;";
    svgNode.setAttribute("aria-hidden", "true");

    // Ensure the document body exists before appending
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
   * NETWORK FETCHING (WITH CACHE BUSTING)
   * ============================================================================
   * Fetches the SVG sprite file from the CDN. Returns true if successful.
   */
  async function loadSprite(spriteFile) {
    // If already loaded successfully, return true
    if (loadedSprites.has(spriteFile)) return true;

    // If currently fetching, wait for the existing promise to resolve
    if (activeFetches.has(spriteFile)) {
      return await activeFetches.get(spriteFile);
    }

    const fetchPromise = (async () => {
      try {
        // Appending timestamp to strictly bypass browser and CDN caching
        const liveUrl = `${BASE_URL}/${spriteFile}?t=${new Date().getTime()}`;
        
        const response = await fetch(liveUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.text();
        if (!data.includes("<svg")) throw new Error("Fetched file is not a valid SVG");

        injectSprite(data, spriteFile);
        loadedSprites.add(spriteFile);
        return true;

      } catch (error) {
        console.error(`Icon-Stellar: Failed to fetch sprite ${spriteFile}`, error);
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
   * Injects default CSS rules to ensure icons scale properly and look aligned.
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
   * Builds the `<svg><use></use></svg>` structure required to display the icon.
   */
  function createSVGElement(iconId) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    
    // Cross-browser compatibility for referencing the symbol ID
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
   * Scans the DOM for elements with the 'data-icon' attribute and processes them.
   */
  async function renderIcons(rootElement = document) {
    const elements = rootElement.querySelectorAll("[data-icon]:not([data-icon-rendered])");

    for (const el of elements) {
      const value = el.getAttribute("data-icon");
      if (!value) continue;

      // Mark element as processed to avoid redundant rendering cycles
      el.setAttribute("data-icon-rendered", "true");

      const parts = value.split(":");
      
      // STRICT RULE: User must provide all 3 parts (category, name, variant)
      if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
        console.warn(`Icon-Stellar: Invalid format "${value}". Must be "category:name:variant".`);
        el.innerHTML = `<span class="icon-missing" title="Invalid format">☒</span>`;
        continue;
      }

      const category = parts[0];
      const name = parts[1];
      const variant = parts[2];

      const spriteFile = `${category}.svg`;
      const iconId = `${name}-${variant}`;

      // Await the fetching and injection of the required sprite
      const isSpriteLoaded = await loadSprite(spriteFile);

      // VALIDATION: Check if sprite failed OR if the specific icon ID does not exist in the DOM
      if (!isSpriteLoaded || !document.getElementById(iconId)) {
        console.warn(`Icon-Stellar: Icon '${iconId}' not found in ${spriteFile}.`);
        el.innerHTML = `<span class="icon-missing" title="Icon not found">☒</span>`;
        continue;
      }

      // Success: Render the SVG graphic
      const svg = createSVGElement(iconId);
      el.innerHTML = "";
      el.appendChild(svg);
    }
  }

  /**
   * ============================================================================
   * DYNAMIC DOM OBSERVATION
   * ============================================================================
   * Listens for changes in the DOM (useful for frameworks or Elementor).
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
        // Debounce slightly to allow batches of nodes to load first
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

    // Secondary scan as a fallback for slow-loading page builders
    setTimeout(() => renderIcons(), 1500);
  }

  // Ensure DOM is fully accessible before running
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();