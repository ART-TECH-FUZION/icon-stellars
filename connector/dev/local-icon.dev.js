// ======================================================
// ICON-STELLAR - SELF HOSTED VERSION
// ======================================================
// Purpose:
// - Use without CDN
// - User hosts files on their own server
// - Production ready for custom websites
// ======================================================

(function () {

    // ==================================================
    // 🔹 BASE PATH (VERY IMPORTANT)
    // ==================================================
    // 👉 User MUST set this according to their project
    // Example:
    // "/assets/icons/sprites"
    // "/wp-content/themes/theme-name/icons/sprites"

    const BASE = window.ICON_STELLAR_BASE || "/assets/icons/sprites";


    // ==================================================
    // 🔹 DEFAULT STYLE
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
        }`;

        document.head.appendChild(style);
    }


    // ==================================================
    // 🔹 CREATE SVG
    // ==================================================
    function createSVG(url) {

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const use = document.createElementNS("http://www.w3.org/2000/svg", "use");

        use.setAttribute("href", url);

        svg.appendChild(use);
        svg.classList.add("is-icon");

        return svg;
    }


    // ==================================================
    // 🔹 RENDER ICONS
    // ==================================================
    function renderIcons() {

        document.querySelectorAll("[data-icon]").forEach(el => {

            const value = el.getAttribute("data-icon");

            if (!value || !value.includes(":")) {
                console.warn("❌ Icon-Stellar: Invalid format →", value);
                return;
            }

            const parts = value.split(":");

            const category = parts[0];
            const name = parts[1];
            const variant = parts[2] || "regular";

            const spriteFile = `${category}.svg`;
            const iconId = `${name}-${variant}`;

            const url = `${BASE}/${spriteFile}#${iconId}`;

            const svg = createSVG(url);

            el.innerHTML = "";
            el.appendChild(svg);
        });
    }


    // ==================================================
    // 🔹 INIT
    // ==================================================
    function init() {
        injectDefaultStyles();
        renderIcons();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();