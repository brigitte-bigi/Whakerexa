/**
 :filename: statics.js.slides.overview_view.js
 :author: Brigitte Bigi
 :contact: contact@sppas.org
 :summary: DOM rendering for the overview view mode.

 -------------------------------------------------------------------------

 This file is part of Whakerexa: https://whakerexa.sf.net/

 Copyright (C) 2023-2026 Brigitte Bigi, CNRS
 Laboratoire Parole et Langage, Aix-en-Provence, France

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.

 This banner notice must not be removed.

 -------------------------------------------------------------------------

 */

'use strict';

/**
 * Builds and displays the overview panel.
 *
 * Each slide is represented as an <article> with:
 *   <header>  slide number
 *   <main>    cloned slide content
 *   <footer>  GoTo button
 *
 * GoTo buttons dispatch CustomEvents — no callback needed, no reference
 * to any controller or logic module.
 */
export default class OverviewView {

    /**
     * @param {HTMLElement[]} slides - Source slides (will be cloned).
     * @param {HTMLElement} panelElement - The container for the overview.
     */
    constructor(slides, panelElement) {
        this._slides = Array.isArray(slides)
            ? slides.map(s => s.cloneNode(true))
            : [];

        this._panel = panelElement instanceof HTMLElement ? panelElement : null;

        if (this._panel !== null) {
            this._panel.style.display = 'none';
        }
    }

    // -----------------------------------------------------------------------
    // Called once during init
    // -----------------------------------------------------------------------

    /**
     * Populate the overview panel with cloned slide articles.
     */
    build() {
        if (this._panel === null) {
            return;
        }

        this._panel.innerHTML = '';

        this._slides.forEach((slide, i) => {
            const index = i + 1;

            const article = document.createElement('article');
            article.className = 'overview-item';

            // Header: slide number
            const header = document.createElement('header');
            header.textContent = String(index);
            article.appendChild(header);

            // Main: cloned slide content (inner HTML only)
            const main = document.createElement('main');
            main.appendChild(
                document.createRange().createContextualFragment(slide.innerHTML)
            );
            article.appendChild(main);

            // Footer: GoTo button
            const footer = document.createElement('footer');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = 'GoTo';
            btn.addEventListener('click', () => {
                // Navigate to this slide and switch back to presentation
                document.dispatchEvent(new CustomEvent('slides:navigate', {
                    detail: { action: 'goTo', index, step: 0 }
                }));
                document.dispatchEvent(new CustomEvent('slides:viewmode', {
                    detail: { mode: 'presentation' }
                }));
            });
            footer.appendChild(btn);
            article.appendChild(footer);

            this._panel.appendChild(article);
        });
    }

    // -----------------------------------------------------------------------
    // Called by SlidesAssembler via modeLogic.onModeChange
    // -----------------------------------------------------------------------

    /**
     * @param {import('./slides_data.js').default} data
     */
    onModeChange(data) {
        if (this._panel === null) {
            return;
        }
        this._panel.style.display = data.mode === 'overview' ? 'block' : 'none';
    }
}
