# Whakerexa — A minimalist and lightweight web kit for accessible contents


## Overview

`Whakerexa` is a lightweight front-end toolkit that blends clarity, accessibility, and flexibility, and long-term maintainability.
It provides a modern CSS foundation and a fully modular ES6 JavaScript components to build interfaces that are both elegant and inclusive — with minimal code and maximum readability, without dependencies.

Designed around accessibility from the start, Whakerexa makes it easy to craft clean, human-friendly HTML that just works — without drowning your pages in class names or dependencies.
Every visual aspect — colors, typography, spacing, animations — is defined through CSS variables, giving you full creative control with a few redefinitions.

Version 2.0 introduces a unified public API through `wexa.js` and a stable global namespace through `wexa.bundle.js`, ensuring support for both modern ES6 module-based applications and offline/static environments.

It pairs naturally with `WhakerPy`, the lightweight Python library for generating dynamic HTML, offering a seamless workflow from code to design.



### Features

- ✨ Lightweight, semantic, dependency-free, and modular
- 🌓 Built-in light / dark themes
- 🔆 High-contrast accessibility mode
- 🎨 Fully customizable through CSS variables — using `@layer` so your rules always win without `!important`
- 🧩 Composable and extensible — adapt to your needs
- ⚙️ Object-oriented ES6 components
- ⚙️ Unified API (`import … from "wexa.js"` or `Wexa.*`)
- ⚙️ Single-file bundle for no-module environments
- ⚙️ Zero dependencies, 100 % open source


## Install Whakerexa

Whakerexa is distributed as a ZIP archive.  
Simply unpack it.


## Quick Start

For usage examples of the CSS and JS frameworks, visit the **online documentation**:

👉 <https://whakerexa.sourceforge.io>

The HTML files available in the `docs` folder are also provided for offline reference,
but note that dynamic examples (those using JavaScript modules) require a web server
and will not work if opened directly from your disk (`file://` protocol).

Browse the local documentation with:
``` 
> python -m http.server 8000 
```
Then open a new tab into Firefox with the url: http://localhost:8000/docs/


## Projects using Whakerexa

Whakerexa was initially developed within SPPAS <https://sppas.org>. 
It was extracted from its original software in 2024 by the author to lead its own life as standalone tool.


### Websites

It is used by the website of the "AutoCuedSpeech" project at <https://auto-cuedspeech.org> and the website of SPPAS <https://sppas.org>.


## Author/Copyright

Copyright (C) 2023-2026 - Brigitte Bigi, CNRS - <contact@sppas.org>
Laboratoire Parole et Langage, Aix-en-Provence, France.

See the AUTHORS file for the full list of contributors.


## License

Whakerexa is under the terms of the GNU Affero General Public License, version 3.


## Support

Whakerexa was initially developed within <https://auto-cuedspeech.org> project, generously funded by FIRAH (Fondation Internationale de Recherche Appliquée sur le Handicap), <https://www.firah.org/>.
It is also developed with the support of Laboratoire Parole et Langage <https://lpl-aix.fr>.



# Changes

## Version 0.1

- Initial version, extracted from SPPAS 4.17.
- Added or updated, and tested JavaScripts 
- Updated CSS frameworks to be more generic
- Added HTML documentation of the CSS frameworks
- Added a CSS/JS framework for playing a video in a popup dialog

## Version 0.2

- Added code.css, a set of colors for highlighting source code.
- Added menu.css, a solution for an accessible responsive sticky menubar
- Added layout.css, a set of classes to easily organize HTML content
- Added accordion.js which must be added when using "rise-panel"

## Version 0.3

- Changed some colors of code.css
- Added variable 'border-radius' in wexa.css
- Modified details/summary to act and look like buttons
- The "rise-panel/accordion" is deprecated (HTML-3), use HTML-5 details/summary instead
- Added modal dialogs to show an alert message: info, success, warning, error, tips, question

## Version 0.4

This is mainly a bug-correction version: adjusted some width, removed transparency of 
background dialogs, corrected a bug in accessibility.

## Version 0.5 

- Added accessibility icons
- Added upload of files in request.js
- Minor CSS changes
- Migrated license, from GPL to AGPL.

## Version 0.6

- Added `sortatable`: a CSS/JS utility designed for sorting table rows in ascending or descending order
- Added `toggleselect`: CSS/JS utility for toggling checkbox states.
- Added custom buttons: introduced CSS classes `text-reveal-button`, `action-button`, `apply-button` and `switch`.
- Updated request.js: better support of upload, better error management in post.

## Version 0.7

- Re-organized documentation
- Updated the switch button
- Debug of action-button
- Minor changes in wexa.css

## Version 0.8

- This is mainly some debug.

## Version 1.0

Version 1.0 establishes Whakerexa as a modular, object-oriented web kit centered on a unified entry point.

- Core entry point: `wexa.js`, which instantiates:
    1. OnLoadManager — Delayed, ordered component initialization.
    2. WexaLogger — Unified logging.
    3. AccessibilityManager — Color mode (light/dark) and contrast mode.
    4. MenuManager — Navigation menus and submenus.
    5. DialogManager — Opening/closing dialogs and popup videos.

- Menus are fully re-implemented (CSS + JS). See `docs/menu.html`.
- Dialogs are managed by `DialogManager` (legacy functions replaced).
- Backward compatibility with pre-1.0 procedural APIs is limited and not fully ensured.
- Not all minor/specialized classes have been ported (e.g., `Book`, `ToggleSelector`, `SortaTable`).

This version also includes a set of monochrome SVG icons.

## Version 2.0 

Version 2.0 is a complete modernization.
Previous procedural APIs are not preserved.

- Unified ES6 entry point (`wexa.js`) exporting all components.
- `wexa.bundle.js` exposes the global namespace `window.Wexa` for `file://` usage.
- The `progress()` function is removed. Use the `ProgressBar` class instead (see `docs/progressbar.html`).
- Use `Wexa.onload` instead of `OnLoadManager`, `Wexa.dialog` instead of `DialogManager`, etc.
- `WexaLogger` is extended: numeric levels from 0 (most verbose) to 50 (critical only). Messages are shown when their level is >= the current `logLevel`.
- Improved `request.js`: JSON detection through `Content-Type` with silent fallback for non-JSON responses.
- Updated documentation and offline demos. Fixed license documentation to GFDL 1.3, except for slides. See: <https://www.gnu.org/licenses/fdl-1.3.en.html> for details.
- Added an "extra" JS package for slides. Currently proposed as a PoC.


## Version 2.1 - stable

Increased accessibility and corrected bugs.


## Version 3.0

This release introduces architectural changes in CSS and JavaScript. Previous CSS selectors and JS APIs are not preserved.

### CSS architecture

- `wexa.css` uses CSS Cascade Layers (`@layer reset, base, theme, accessibility`).
  App-level rules written outside any `@layer` override wexa defaults without `!important`.
- Light/dark/contrast themes selected with `.dark` and `.contrast` classes on `:root`
  (old `[data-theme=dark]` attribute selectors removed).
- All decoration rules (blockquote borders, button padding, fieldset, figcaption, etc.)
  are in `@layer theme`. `@layer base` is restricted to structure and accessibility.
  Alternative themes override any visual default cleanly, without `!important`.
- Print styles extracted to `print.css` (loaded with `media="print"`).
  Unlayered, so it correctly overrides any `@layer theme` dark-mode rules when printing.
- `--screen-width` CSS variable removed; body width set with `min()` directly.
- Fixed column widths in `table[role="grid"]`: removed the conflicting `width: 10%` default
  so inline widths on `<th scope="col">` are fully respected with `table-layout: fixed`.

### Themes

Alternative themes are standalone CSS files containing only an `@layer theme` block,
loaded after `wexa.css`. They override the default visual style without touching structure
or accessibility.

- `extras/wexa_theme.css` (renamed from `wexa_theme_docs.css`): primary Whakerexa
  documentation theme — navy/teal palette, animated links, flat type scale.
- `extras/wexa_theme_aurora.css`: Aurora theme (blue, mauve, violet palette).
- `extras/wexa_theme_highcontrast.css`: high-contrast theme; adds unlayered overrides for
  `.slide h1` and `.slide > h2` to replace gradients with flat colors.
- Each theme defines `--custom-color1` / `--custom-color2` within `@layer theme`.
- CSS themes are loaded statically and are not managed by JavaScript.
- `docs/theme_aurora.html`: live demo page.

### ThemeManager

New `extras/theme_manager.js`, exposed as `window.Wexa.ThemeManager`:

- `register(name, path)` — registers a named theme (CSS file path relative to the page).
- `setDefault(name)` — fallback theme; applied immediately on load so the default is visible
  even when the bundle is loaded dynamically (`file://` protocol).
- `activate(name)` — applies a theme by injecting a `<link id="wexa-theme">` into `<head>`;
  persists the choice via the `wexa_theme` URL parameter.
- `next()` — cycles through registered themes, wrapping back to the default theme.
- Theme propagation through links and form submissions mirrors `AccessibilityManager`.

### Accessibility

- Skip links (`<a class="skip">`) no longer carry `role="button"`.
- Accessibility toggle buttons (`btn-contrast`, `btn-color`) no longer carry `role="menuitem"`;
  the implicit `role="button"` of `<button>` is required for `aria-pressed` to work correctly.
- `btn-theme` renamed to `btn-color` throughout (CSS, JS, HTML).
- SVG icons for `btn-contrast` and `btn-color` are now injected as inline SVG at DOM load,
  replacing the former `background-image` data-URI approach so icons inherit `currentColor`.
- `wexa.css`: removed `--icon-contrast` and `--icon-color`; added
  `.menuitem.accessibility svg { color: inherit; }`.

### JavaScript

`AccessibilityManager` simplified: manages exactly two binary modes — color mode (light/dark)
and contrast mode (normal/high-contrast).

- Removed: `addColorScheme()`, `removeColorScheme()`, `addContrastScheme()`, `removeContrastScheme()`,
  `activateColorScheme()`, `activateContrastScheme()`, all deprecated snake_case wrappers.
- `#colors` and `#contrasts` registries replaced by static constants
  `AccessibilityManager.COLOR_MODE` (`"dark"`) and `AccessibilityManager.CONTRAST_MODE` (`"contrast"`).
- Getters renamed: `activatedColorMode`, `activatedContrastMode`.

### Layout

- `flex-panel` items expand to full width on narrow screens (≤ 820 px).
  `.width_10` … `.width_95` helpers also reset to `100%` on mobile.
- Card inner zones renamed to avoid invalid HTML nesting:
  `.card-header`, `.card-body`, `.card-footer` (was `<header>`, `<main>`, `<footer>`
  inside `<article class="card">`). Use plain `<div>` elements.
- `.scrolled-panel` uses `overflow: auto` (scrollbars appear only when content overflows).
- `cards-panel` grid uses `minmax(min(var(--card-max-width), 100%), 1fr)`.

### Buttons

- New `.cta-button`: call-to-action button with small-caps, uppercase label and drop shadow.
  Defined in `button.css` on `@layer base` — no `!important` needed.

### book.css

- Fixed `counter-reset: subssection` missing from `.ssection` — sub-section numbers now
  reset correctly at the start of each section.
- `@media print` block removed; print overrides moved to `print.css`.
- `--numbers-color` split into `--numbers-bg-color` (badge background) and
  `--numbers-fg-color` (text color inside the badge).

### Dark mode

- `code.css`: complete dark-mode palette for all Pygments token classes.
  String types use a warm-orange foreground with `background-color: transparent`
  (fixes invisible white-on-white text in dark mode).

### Slides

**View modes**

- **Handout mode** (`d` key): all slides as a scrollable column, each preserving its 16:9
  aspect ratio. Print layout uses `break-after: page`.
- **Overview mode** (`o` key): accessible radio group, one button per slide (number + first
  heading). Selecting a slide navigates to it and switches back to presentation mode.
- **Memo mode** (`m` key): all slides as a scrollable column, each paired with its speaker
  notes in a side-by-side grid (65 % slide / 35 % notes).
  Slide content scaled with `transform: scale(0.65)`.
- Pressing the active mode key again toggles back to presentation mode.
  `ViewModeLogic.toggle(mode)` is the single implementation.
- Incremental items (`.incremental`, `.incremental-invisible`) are fully visible in all
  non-presentation modes.

**Speaker notes HTML contract**

Notes are `<aside for="slide-id" aria-label="Speaker notes">` siblings of
`<section class="slide" id="slide-id">` — not embedded inside the slide.
`aside[for]` is hidden by default and shown only in memo mode (`note_view.js`).

**Help dialog**

Pressing `h`, `H`, or `?` opens a modal keyboard-shortcut reference.
`keyboard_controller.js`: `SHORTCUTS` static array is the single source of truth for all
key bindings and their labels.

**CSS theming architecture**

`extras/slides.css` is split into two zones:
- **Unlayered** (structural invariants): 32 px font size, 16:9 layout, transitions, controls
  positioning. These rules are inviolable by themes.
- **`@layer theme`** (visual defaults): `--custom-color1` / `--custom-color2`, heading font
  families, gradients, border-image, figcaption color, quote marks. Theme files loaded after
  `slides.css` override these within the same layer.

**Other**

- New `--slide-bg-color` CSS variable: distinct background for slide content.
- Accessibility controls container changed from `<div>` to `<nav class="nav-wexa">`.

### Minor fixes

- `dialog.css`: `hidden-alert` correctly hides dialogs at load time; `dialog[role=alertdialog]`
  gains `max-height: 80vh`, `min-width: min(28rem, 80vw)`, `overflow-y: auto`.
- `slides.css`: fixed `:root.contrast` selector; removed debug artifact; dropped obsolete vendor
  prefixes; scoped `li` and `q` rules to `.slide`; `color: var(--bg-color)` replaced by
  `color: var(--custom-color1)` wherever `--custom-color2` is used as background.
- `slides.css`: radio inputs inside view-mode controls visually hidden (`position: absolute`)
  so label text is correctly centered.
- `wexa.css`: added `label > [type=radio]` and `label > [type=checkbox]` hiding rule.
- `sortatable.css`: copyright year corrected.
- `toggleselect.css`: removed dead `.check-item:before` rule; `.action-button` renamed to
  `.toggleselect-action` to avoid naming collisions.
- `wexa_theme_highcontrast.css`: `--custom-color1`/`--custom-color2` fix applied to `.slide > h2`.

### Breaking changes

| What changed | Old value | New value |
|---|---|---|
| CSS theme selector | `[data-theme=dark]` | `.dark` class on `:root` |
| Card inner zones | `<header>`, `<main>`, `<footer>` inside `<article class="card">` | `<div class="card-header/body/footer">` |
| Slide notes HTML | `<aside role="note">` inside `<section class="slide">` | `<aside for="slide-id">` sibling |
| toggleselect action button | `.action-button` | `.toggleselect-action` |
| book ToC nav class | `.side-nav` | `.book-toc` |
| book number variable | `--numbers-color` | `--numbers-bg-color` / `--numbers-fg-color` |
| Print styles | `@media print` blocks per file | `print.css` with `media="print"` |
| Accessibility color button id | `btn-theme` | `btn-color` |
| Accessibility button icons | `background-image` data-URI | inline SVG injected by `AccessibilityManager` |

