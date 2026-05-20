# icon-stellar

A high-quality open-source library of optimized SVG icons designed for modern user interfaces. icon-stellar provides crisp, clean icons with multiple stroke variants to fit any design aesthetic, along with built-in tools to generate custom SVG sprite files for your web applications.

---

## Table of Contents

- [Features](#features)
- [Icon Variants](#icon-variants)
- [Quick Start (CDN Integration)](#quick-start-cdn-integration)
- [How It Works](#how-it-works)
- [Icon Syntax Reference](#icon-syntax-reference)
- [Local/Offline Installation](#localoffline-installation)
- [Available Tools](#available-tools)
- [Icon Categories](#icon-categories)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Optimized SVG Icons** - Lightweight, scalable vector graphics
- **Multiple Stroke Variants** - Regular, Light, and Solid styles
- **CDN Ready** - One-line integration via jsDelivr
- **Sprite-Based Loading** - Efficient HTTP requests with SVG sprites
- **Auto-Rendering** - Dynamically renders icons from HTML attributes
- **DOM Observation** - Automatically handles dynamically added icons
- **Custom Sprite Generation** - Tools to create optimized sprite files
- **Open Source** - Free for personal and commercial use

---

## Icon Variants

icon-stellar provides three stroke variants to match different design requirements:

| Variant | Stroke Width | Use Case |
|---------|--------------|----------|
| **Light** | 1.5px | Minimalist designs, secondary UI elements |
| **Regular** | 2px | Standard UI icons, primary navigation |
| **Solid** | 3px | Bold emphasis, call-to-action elements |

---

## Quick Start (CDN Integration)

### Step 1: Add the Script

Add the following script tag to your HTML `<head>` section:

```html
<script src="https://cdn.jsdelivr.net/gh/art-tech-fuzion/icon-stellars@8ad95f6d545e06326bebb29a499687de3093440a/connector/prod/icon.js" defer></script>
```

> **Note:** Replace the version commit hash `@8ad95f6...` with a specific version tag or `@latest` to always get the newest version. `{Latest Release: v1.0.0}`

### Step 2: Use Icons in Your HTML

Add icons anywhere in your HTML using the `data-icon` attribute:

```html
<span data-icon="all:instagram-regular"></span>
<span data-icon="all:facebook-regular"></span>
<span data-icon="all:twitter-regular"></span>
```

### Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>icon-stellar Demo</title>
    <script src="https://cdn.jsdelivr.net/gh/art-tech-fuzion/icon-stellars@8ad95f6d545e06326bebb29a499687de3093440a/connector/prod/icon.js" defer></script>
    <style>
        .icon-container {
            display: flex;
            gap: 20px;
            font-size: 24px;
            align-items: center;
        }
    </style>
</head>
<body>
    <div class="icon-container">
        <span data-icon="all:instagram-regular"></span>
        <span data-icon="all:facebook-regular"></span>
        <span data-icon="all:twitter-regular"></span>
    </div>
</body>
</html>
```

---

## How It Works

icon-stellar uses an intelligent sprite-based system:

1. **Script Loading** - When the page loads, the JavaScript automatically fetches the sprite file from the CDN
2. **Sprite Injection** - The SVG sprite is injected into the DOM as a hidden element
3. **Icon Rendering** - All elements with `data-icon` attributes are automatically converted to inline SVG icons
4. **Dynamic Support** - The script observes DOM changes and renders icons added dynamically via JavaScript

### Technical Flow

```
HTML Element (<span data-icon="...">)
         ↓
    JavaScript Detection
         ↓
    Sprite File Fetch (if not cached)
         ↓
    SVG Use Element Creation
         ↓
    Inline SVG Display
```

---

## Icon Syntax Reference

The `data-icon` attribute uses the following format:

```
data-icon="sprite-category:icon-name-variant"
```

### Components

| Component | Description | Example |
|-----------|-------------|---------|
| **sprite-category** | The sprite file to use | `all` (recommended), `dev` |
| **icon-name** | The specific icon identifier | `instagram`, `facebook`, `home` |
| **variant** | Stroke variant | `regular`, `light`, `solid` |

### Examples

```html
<!-- Regular stroke icons (2px) -->
<span data-icon="all:instagram-regular"></span>
<span data-icon="all:home-regular"></span>

<!-- Light stroke icons (1.5px) -->
<span data-icon="all:instagram-light"></span>
<span data-icon="all:home-light"></span>

<!-- Solid stroke icons (3px) -->
<span data-icon="all:instagram-solid"></span>
<span data-icon="all:home-solid"></span>
```

---

## Local/Offline Installation

For projects that cannot rely on external CDN, you can host the icons locally:

### Step 1: Generate a Custom Sprite

1. Visit the [Sprite Generator](https://art-tech-fuzion.github.io/icon-stellars/tools/prod/sg.html)
2. Select the icons you want to include
3. Download the generated sprite file

### Step 2: Configure local-icon.js

1. Download `connector/prod/local-icon.js` from this repository
2. Open the file and configure the following variables:

```javascript
// Your sprite file location
const PRIMARY_BASE = "/path/to/your/sprites";

// Version number - increment this when you update the sprite file
const SPRITE_VERSION = "1.0.0";
```

3. Load the configured file globally in your project - ensure it loads on every page where icons are used. This is the recommended approach for consistent icon rendering across your entire website.

### Version Management

**Important:** When you update your sprite file, you must increment the `SPRITE_VERSION` variable. Otherwise, the browser will serve the cached (old) version and your new icons won't appear.

```javascript
// After updating sprite file
const SPRITE_VERSION = "1.0.1";  // Increment this number
```

### Performance Tip

For optimal performance, include the script globally. If you need page-specific loading for optimization, ensure the script loads on every page where icons are used.

---

## Available Tools

### 1. Sprite Viewer

Preview all available icons and their variants:

**URL:** [https://art-tech-fuzion.github.io/icon-stellars/tools/prod/sv.html](https://art-tech-fuzion.github.io/icon-stellars/tools/prod/sv.html)

Use this tool to:
- Browse all available icons
- See stroke variants (light, regular, solid)
- Copy icon names for use in your projects

### 2. Sprite Generator

Create custom optimized sprite files:

**URL:** [https://art-tech-fuzion.github.io/icon-stellars/tools/prod/sg.html](https://art-tech-fuzion.github.io/icon-stellars/tools/prod/sg.html)

Use this tool to:
- Select specific icons for your project
- Generate a lightweight custom sprite file
- Reduce page load by including only needed icons

---

## Icon Categories

icon-stellar includes icons organized by category:

### Brand Icons
Social media and brand logos:
- instagram, facebook, twitter, linkedin, pinterest
- whatsapp, telegram, snapchat, google

### UI Icons
General user interface icons:
- home, search, profile, settings
- heart, star, bookmark, cart
- menu, close, arrow, filter
- property, building, location
- upload, download, share
- And many more...

---

## Contributing

We welcome contributions from the community! To contribute new icons:

### Requirements

1. **Format** - Icons must be SVG format with proper viewBox (24x24)
2. **Stroke Style** - Follow existing stroke widths (1.5px for light, 2px for regular, 3px for solid)
3. **ID Naming** - Use format: `{icon-name}-{variant}` (e.g., `instagram-regular`)
4. **Design Consistency** - Match the style of existing icons in the library

### Submission Process

1. Create your SVG icon following the requirements
2. Place it in the appropriate directory:
   - `svg/light/ui-icon/` for light variants
   - `svg/regular/ui-icon/` or `svg/regular/brand-icon/` for regular variants
   - `svg/solid/ui-icon/` or `svg/solid/social-icon/` for solid variants
3. Submit a pull request to the main branch
4. Our team will review your submission
5. If all requirements are met, your icon will be merged

### Checking Existing Icons

Download any icon from the `svg/` folder and examine it in Figma or any SVG editor to understand the exact dimensions and format required.

---

## License

icon-stellar is open source and available under the MIT License.

---

## Support

- **Issues:** Report bugs or request features via GitHub Issues
- **Documentation:** Check this README and the online tools for guidance
- **Updates:** Watch the repository for new icons and improvements