/**
 * :filename: wexa_statics.js.extras.slides.slides.init.js
 * :author: Brigitte Bigi
 * :contact: contact@sppas.org
 * :summary: One-tag initializer for Whakerexa Slides.
 *
 *  -------------------------------------------------------------------------
 *
 *  This file is part of Whakerexa: https://github.com/brigitte-bigi/Whakerexa
 *
 *  Copyright (C) 2023-2026 Brigitte Bigi, CNRS
 *  Laboratoire Parole et Langage, Aix-en-Provence, France
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 *  This banner notice must not be removed.
 *
 *  -------------------------------------------------------------------------
 *
 *  -------------------------------------------------------------------------
 *  Theme use cases
 *  -------------------------------------------------------------------------
 *
 *  Case 1 — No theme (plain wexa.css only):
 *    <script type="module" src="slides.init.js"></script>
 *
 *  Case 2 — Whakerexa built-in themes, switch on the fly:
 *    <script type="module" src="slides.init.js"
 *            data-themes="wexa:wexa_theme.css,aurora:wexa_theme_aurora.css"
 *            data-default="wexa"
 *            data-themes-path="wexa_statics/css/themes/">
 *    </script>
 *
 *  Case 3 — No ThemeManager, custom overrides in a <style> block:
 *    <style>
 *        @layer theme { :root { --a-color: rgb(200, 0, 0); } }
 *    </style>
 *    <script type="module" src="slides.init.js"></script>
 *
 *  Case 4 — Own theme only, no switching (load as a static CSS link):
 *    <link rel="stylesheet" href="my_theme.css">
 *    <script type="module" src="slides.init.js"></script>
 *
 *  Case 5 — Own theme + Whakerexa themes, switch on the fly.
 *    Use explicit paths in data-themes (omit data-themes-path):
 *    <script type="module" src="slides.init.js"
 *            data-themes="mine:./my_theme.css,wexa:wexa_statics/css/themes/wexa_theme.css,aurora:wexa_statics/css/themes/wexa_theme_aurora.css"
 *            data-default="mine">
 *    </script>
 *    Any file starting with ./ ../ / or http is used as-is.
 *    data-themes-path (if set) is prepended only to bare filenames.
 *
 *  -------------------------------------------------------------------------
 *  Data attributes (all optional)
 *  -------------------------------------------------------------------------
 *
 *    data-themes      Comma-separated "name:file.css" pairs. Registers themes
 *                     with ThemeManager. Omit entirely to skip ThemeManager.
 *    data-default     Name of the theme active on load (must be in data-themes).
 *    data-themes-path Common path prefix for bare filenames in data-themes.
 *                     Omit when themes live in different directories — use
 *                     explicit paths in data-themes instead (see case 5).
 *    data-mode        Initial view mode: "presentation" (default), "handout", "note".
 *    data-logo        Path to a logo image (relative to the HTML page).
 *                     Omit → no logo. The image is wrapped in #logo-container
 *                     and positioned top-right. Override by writing your own
 *                     <div id="logo-container"> in the HTML.
 *    data-progress    "true" (default) or "false". Set to "false" to disable
 *                     the progress bar entirely (not injected, not wired).
 *
 *  Auto-injection: the following elements are created and appended to <body>
 *  if absent from the HTML. Provide your own element with the same id to
 *  override the default structure — slides.init.js will use it as-is.
 *    #accessibility-controls   nav: theme-switcher + color-scheme button
 *    #progress-container       progress bar wrapper  (skipped if data-progress="false")
 *    #progress-bar             progress bar fill     (skipped if data-progress="false")
 *    #overview-container       overview panel
 *    #nav-content              Prev/Next/First/Last/GoTo/Fullscreen + view-mode group
 *    #slides-controls-view     radio group inside #nav-content
 *    #logo-container           injected only when data-logo is set
 */

// ES6 module — strict and scoped by default. No IIFE needed.

const base = new URL('.', import.meta.url).href;

// Read data-* from our own <script type="module"> element.
const _self = [...document.querySelectorAll('script[type="module"][src]')]
    .find(s => { try { return new URL(s.src).href === import.meta.url; } catch { return false; } });

const themesAttr  = (_self?.dataset.themes     || '').trim();
const defaultName = (_self?.dataset.default    || '').trim();
const themesPath  = (_self?.dataset.themesPath || '').trim();
const mode        = (_self?.dataset.mode       || 'presentation').trim();
const logoSrc     = (_self?.dataset.logo       || '').trim();
const progressOn  = (_self?.dataset.progress   !== 'false');

// -----------------------------------------------------------------------
// Inject standard boilerplate elements that are absent from the page.
// Each block is skipped when the element already exists (user override).
// -----------------------------------------------------------------------

function injectBoilerplate() {

    if (progressOn && !document.getElementById('progress-container')) {
        const pc = document.createElement('div');
        pc.id = 'progress-container';
        const pb = document.createElement('div');
        pb.id = 'progress-bar';
        pc.appendChild(pb);
        document.body.appendChild(pc);
    }

    if (!document.getElementById('overview-container')) {
        const ov = document.createElement('div');
        ov.id = 'overview-container';
        document.body.appendChild(ov);
    }

    if (!document.getElementById('accessibility-controls')) {
        const nav = document.createElement('nav');
        nav.id = 'accessibility-controls';
        nav.className = 'nav-wexa controls-hidden';
        nav.setAttribute('aria-label', 'Accessibility controls');

        if (themesAttr) {
            // Theme-switcher button — only when themes are registered
            const btnTheme = document.createElement('button');
            btnTheme.id = 'btn-css-theme';
            btnTheme.className = 'menuitem';
            btnTheme.type = 'button';
            btnTheme.setAttribute('aria-label', 'Switch theme');
            btnTheme.title = 'Switch theme';
            btnTheme.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"' +
                ' fill="none" stroke="currentColor" stroke-width="2"' +
                ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                '<circle cx="16" cy="16" r="13"/>' +
                '<circle cx="16" cy="16" r="5" fill="currentColor" stroke="none"/>' +
                '<line x1="16" y1="3"  x2="16" y2="8"/>' +
                '<line x1="16" y1="24" x2="16" y2="29"/>' +
                '<line x1="3"  y1="16" x2="8"  y2="16"/>' +
                '<line x1="24" y1="16" x2="29" y2="16"/>' +
                '</svg>';
            btnTheme.addEventListener('click', function () {
                window.themes && window.themes.next();
            });
            nav.appendChild(btnTheme);
        }

        const btnColor = document.createElement('button');
        btnColor.id = 'btn-color';
        btnColor.className = 'menuitem accessibility';
        btnColor.setAttribute('aria-label', 'color');
        btnColor.setAttribute('aria-pressed', 'false');
        btnColor.addEventListener('click', function () {
            window.Wexa && window.Wexa.accessibility && window.Wexa.accessibility.switchColorScheme();
        });
        nav.appendChild(btnColor);

        document.body.appendChild(nav);
    }

    if (!document.getElementById('nav-content')) {
        const nav = document.createElement('nav');
        nav.id = 'nav-content';
        nav.className = 'nav-wexa bottom controls-hidden';
        nav.setAttribute('aria-label', 'Slide navigation');
        nav.innerHTML =
            '<button class="menuitem" id="btn-prev">Prev</button>' +
            '<button class="menuitem" id="btn-next">Next</button>' +
            '<button class="menuitem" id="btn-back">First</button>' +
            '<button class="menuitem" id="btn-last">Last</button>' +
            '<button class="menuitem" id="btn-goto">Go to</button>' +
            '<button class="menuitem" id="btn-fullscreen">Fullscreen</button>' +
            '<div id="slides-controls-view" role="radiogroup" aria-label="View mode">' +
                '<label class="menuitem" for="btn-overview">' +
                    '<input type="radio" name="view-mode" id="btn-overview" value="overview">' +
                    ' Overview' +
                '</label>' +
                '<label class="menuitem" for="btn-handout">' +
                    '<input type="radio" name="view-mode" id="btn-handout" value="handout">' +
                    ' Handout' +
                '</label>' +
                '<label class="menuitem" for="btn-presentation">' +
                    '<input type="radio" name="view-mode" id="btn-presentation" value="presentation" checked>' +
                    ' Slides View' +
                '</label>' +
            '</div>';
        document.body.appendChild(nav);
    }

    // Logo overlay — injected only when data-logo is set
    if (logoSrc && !document.getElementById('logo-container')) {
        const logo = document.createElement('div');
        logo.id = 'logo-container';
        logo.className = 'top right';
        const img = document.createElement('img');
        img.src = logoSrc;
        img.alt = '';
        img.className = 'img-logo';
        logo.appendChild(img);
        document.body.appendChild(logo);
    }
}

// -----------------------------------------------------------------------

function buildConfig(SlidesClass) {
    injectBoilerplate();
    return new SlidesClass({
        slides:               document.querySelectorAll('section.slide'),
        controls:             document.getElementById('nav-content'),
        controlsView:         document.getElementById('slides-controls-view'),
        overviewContainer:    document.getElementById('overview-container'),
        progressBarContainer: progressOn ? document.getElementById('progress-container') : null,
        progressBar:          progressOn ? document.getElementById('progress-bar')        : null,
        logo:                 document.getElementById('logo-container'),
        accessibility:        document.getElementById('accessibility-controls'),
        mode
    });
}

// -----------------------------------------------------------------------

function registerThemes(ThemeManager) {
    if (!themesAttr || !ThemeManager) return;
    const t = new ThemeManager();
    for (const entry of themesAttr.split(',')) {
        const parts = entry.trim().split(':');
        const name = parts[0].trim();
        const file = parts[1].trim();
        // Use file as-is when it already carries a path (./  ../  /  http)
        const href = /^([./]|https?:)/.test(file) ? file : themesPath + file;
        t.register(name, href);
    }
    if (defaultName) {
        t.setDefault(defaultName);
    }
    window.themes = t;
}

// -----------------------------------------------------------------------

function ready(app) {
    window.app = app;
    window.dispatchEvent(new CustomEvent('wexa:slides:ready', { detail: { app } }));
}

// -----------------------------------------------------------------------

if (window.location.protocol === 'file:') {

    const s = document.createElement('script');
    s.src = new URL('../../wexa.bundle.js', base).href;
    s.onload = function () {
        window.Wexa = window.Wexa || {};
        injectBoilerplate();
        window.Wexa.accessibility = new window.Wexa.AccessibilityManager();
        registerThemes(window.Wexa && window.Wexa.ThemeManager);
        const app = buildConfig(window.Wexa.Slides);
        app.init();
        ready(app);
    };
    document.head.appendChild(s);

} else {

    // Top-level await — blocks window.onload until resolved.
    // AccessibilityManager is therefore instantiated before window.onload,
    // so OnLoadManager fires its icon-injection function correctly.
    const [slidesModule, wexaModule] = await Promise.all([
        import(new URL('slides.js', base).href),
        import(new URL('../../wexa.js', base).href)
    ]);

    window.Wexa = window.Wexa || {};
    injectBoilerplate();
    window.Wexa.accessibility = new wexaModule.AccessibilityManager();

    if (themesAttr) {
        const { ThemeManager } = await import(new URL('../theme_manager.js', base).href);
        registerThemes(ThemeManager);
    }

    const app = buildConfig(slidesModule.default);
    app.init();
    ready(app);
}
