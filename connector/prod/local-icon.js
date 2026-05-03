(function(){const BASE=window.ICON_STELLAR_BASE||"/assets/icons/sprites";function injectDefaultStyles(){if(document.getElementById("icon-stellar-style"))return;const style=document.createElement("style");style.id="icon-stellar-style";style.innerHTML=`
        .is-icon {
            width: 1em;
            height: 1em;
            fill: currentColor;
            display: inline-block;
            vertical-align: middle;
        }`;document.head.appendChild(style);}function createSVG(url){const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");const use=document.createElementNS("http://www.w3.org/2000/svg","use");use.setAttribute("href",url);svg.appendChild(use);svg.classList.add("is-icon");return svg;}function renderIcons(){document.querySelectorAll("[data-icon]").forEach(el=>{const value=el.getAttribute("data-icon");if(!value||!value.includes(":")){console.warn("❌ Icon-Stellar: Invalid format →",value);return;}const parts=value.split(":");const category=parts[0];const name=parts[1];const variant=parts[2]||"regular";const spriteFile=`${category}.svg`;const iconId=`${name}-${variant}`;const url=`${BASE}/${spriteFile}#${iconId}`;const svg=createSVG(url);el.innerHTML="";el.appendChild(svg);});}function init(){injectDefaultStyles();renderIcons();}if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init);}else{init();}})();