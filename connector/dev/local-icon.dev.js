/**
 * ============================================================================
 * ICON-STELLAR - WORDPRESS CHILD THEME VERSION
 * ============================================================================
 */

(function () {
  "use strict";

  /**
   * ============================================================================
   * CONFIG
   * ============================================================================
   */

  const SPRITE_VERSION = "1.0.0";

  const PRIMARY_BASE =
    "you sprite file location"; 
    // example: "/wp-content/themes/oceanwp-child/assets/icon-sprite";


  /**
   * ============================================================================
   * STATE MANAGEMENT
   * ============================================================================
   */

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

    svgNode.style.cssText =
      "position:absolute;width:0;height:0;overflow:hidden;";

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
   * FETCH SPRITE
   * ============================================================================
   */

  async function loadSprite(spriteFile) {
    if (loadedSprites.has(spriteFile)) return true;

    if (activeFetches.has(spriteFile)) {
      return await activeFetches.get(spriteFile);
    }

    const fetchPromise = (async () => {
      try {
        let response = await fetch(
          `${PRIMARY_BASE}/${spriteFile}?v=${SPRITE_VERSION}`
        );

        if (!response.ok) {
          throw new Error("Sprite not found");
        }

        const data = await response.text();

        if (!data.includes("<svg")) {
          throw new Error("Invalid SVG");
        }

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
   * DEFAULT STYLES
   * ============================================================================
   */

  function injectDefaultStyles() {
    if (document.getElementById("icon-stellar-styles")) return;

    const style = document.createElement("style");

    style.id = "icon-stellar-styles";

    style.innerHTML = `
      .is-icon{
        width:1.1em;
        height:1.1em;
        fill:currentColor;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        vertical-align:middle;
        margin:0 0.25rem;
      }

      .icon-missing{
        font-size:1em;
        display:inline-block;
        vertical-align:middle;
        font-family:sans-serif;
        opacity:0.7;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * ============================================================================
   * CREATE SVG
   * ============================================================================
   */

  function createSVGElement(iconId) {
    const svg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );

    const use = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "use"
    );

    use.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      `#${iconId}`
    );

    use.setAttribute("href", `#${iconId}`);

    svg.appendChild(use);

    svg.classList.add("is-icon");

    return svg;
  }

  /**
   * ============================================================================
   * RENDER ICONS
   * ============================================================================
   */

  async function renderIcons(rootElement = document) {
    const elements = rootElement.querySelectorAll(
      "[data-icon]:not([data-icon-rendered])"
    );

    for (const el of elements) {
      const value = el.getAttribute("data-icon");

      if (!value) continue;

      el.setAttribute("data-icon-rendered", "true");

      const parts = value.split(":");

      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        el.innerHTML =
          `<span class="icon-missing" title="Invalid Format">☒</span>`;

        continue;
      }

      const category = parts[0];
      const iconId = parts[1];

      const spriteFile = `${category}.svg`;

      const isSpriteLoaded = await loadSprite(spriteFile);

      if (!isSpriteLoaded || !document.getElementById(iconId)) {
        el.innerHTML =
          `<span class="icon-missing" title="Icon Not Found">☒</span>`;

        continue;
      }

      const svg = createSVGElement(iconId);

      el.innerHTML = "";

      el.appendChild(svg);
    }
  }

  /**
   * ============================================================================
   * OBSERVER
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

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * ============================================================================
   * INIT
   * ============================================================================
   */

  function init() {
    injectDefaultStyles();

    renderIcons();

    observeDOMChanges();

    setTimeout(() => renderIcons(), 1500);
  }

  /**
   * ============================================================================
   * BOOT
   * ============================================================================
   */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();