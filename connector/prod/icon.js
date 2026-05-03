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
  
  // URL Construction
  const PRIMARY_BASE = `https://cdn.jsdelivr.net/gh/${REPO_PATH}@${DETECTED_VERSION}/sprites`;
  const LATEST_BASE = `https://cdn.jsdelivr.net/gh/${REPO_PATH}@latest/sprites`;
  
  // State tracking
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
   * NETWORK FETCHING (WITH SMART FALLBACK)
   * ============================================================================
   */
  async function loadSprite(spriteFile) {
    if (loadedSprites.has(spriteFile)) return true;

    if (activeFetches.has(spriteFile)) {
      return await activeFetches.get(spriteFile);
    }

    const fetchPromise = (async () => {
      try {
        let response = await fetch(`${PRIMARY_BASE}/${spriteFile}`);
        
        if (!response.ok && DETECTED_VERSION !== "latest") {
          response = await fetch(`${LATEST_BASE}/${spriteFile}`);
        }
        
        if (!response.ok) throw new Error("Resource not found on primary or latest");
        
        const data = await response.text();
        if (!data.includes("<svg")) throw new Error("Invalid SVG content");

        injectSprite(data, spriteFile);
        loadedSprites.add(spriteFile);
        return true;

      } catch (error) {
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
   * STYLING & HELPERS
   * ============================================================================
   */
  function injectDefaultStyles() {
    if (document.getElementById("icon-stellar-styles")) return;
    const style = document.createElement("style");
    style.id = "icon-stellar-styles";
    style.innerHTML = `
      .is-icon { width: 1em; height: 1em; fill: currentColor; display: inline-block; vertical-align: middle; }
      .icon-missing { font-size: 1em; display: inline-block; vertical-align: middle; font-family: sans-serif; opacity: 0.7; }
    `;
    document.head.appendChild(style);
  }

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
   * RENDERING ENGINE (BULLETPROOF ASYNC VERSION FOR ELEMENTOR)
   * ============================================================================
   */
  async function renderSingleIcon(el) {
    const value = el.getAttribute("data-icon");
    if (!value) return;

    // Smart Lock: Mark as processing THIS SPECIFIC exact value
    el.setAttribute("data-icon-rendered", `processing:${value}`);

    const parts = value.split(":");
      
    // Validation
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      el.innerHTML = `<span class="icon-missing" title="Invalid Format">☒</span>`;
      el.setAttribute("data-icon-rendered", value); 
      return;
    }

    const category = parts[0];
    const iconId = parts[1];
    const spriteFile = `${category}.svg`;

    // Wait for the sprite to load
    const isSpriteLoaded = await loadSprite(spriteFile);

    // CRITICAL ELEMENTOR FIX: Abort if user kept typing and changed the name
    if (el.getAttribute("data-icon") !== value) {
      return; 
    }

    // Verify sprite loaded and the specific ID exists
    if (!isSpriteLoaded || !document.getElementById(iconId)) {
      el.innerHTML = `<span class="icon-missing" title="Icon Not Found">☒</span>`;
      el.setAttribute("data-icon-rendered", value);
      return;
    }

    // Inject the final SVG
    const svg = createSVGElement(iconId);
    el.innerHTML = "";
    el.appendChild(svg);
    
    // Mark as completely rendered by saving the EXACT value
    el.setAttribute("data-icon-rendered", value);
  }

  function renderIcons(rootElement = document) {
    const elements = rootElement.querySelectorAll("[data-icon]");

    for (const el of elements) {
      const value = el.getAttribute("data-icon");
      const renderedValue = el.getAttribute("data-icon-rendered");

      // Skip if this exact icon name has already been fully rendered
      if (value === renderedValue) continue;
      
      // Skip if we are currently processing this exact icon name
      if (renderedValue === `processing:${value}`) continue;

      // Render new or changed icons
      renderSingleIcon(el);
    }
  }

  /**
   * ============================================================================
   * DOM OBSERVATION & INITIALIZATION (WITH DEBOUNCE)
   * ============================================================================
   */
  let renderTimeout;

  function observeDOMChanges() {
    const observer = new MutationObserver((mutations) => {
      let shouldRender = false;
      
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) { 
          shouldRender = true; 
          break;
        }
        if (mutation.type === "attributes" && mutation.attributeName === "data-icon") {
          shouldRender = true;
          break;
        }
      }
      
      // Debounce logic: Wait 100ms after the last typing to prevent freezing
      if (shouldRender) {
        clearTimeout(renderTimeout);
        renderTimeout = setTimeout(() => renderIcons(), 100);
      }
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ["data-icon"]
    });
  }

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