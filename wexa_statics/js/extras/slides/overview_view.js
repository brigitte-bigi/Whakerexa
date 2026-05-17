/**
 :filename: statics.js.slides.overview_view.js
 :author: Brigitte Bigi
 :contact: contact@sppas.org
 :summary: DOM rendering for the overview view mode.

 -------------------------------------------------------------------------

 This file is part of Whakerexa: https://github.com/brigitte-bigi/Whakerexa

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
 * Each slide is represented as a <button> showing its number and title.
 * Clicking navigates to the slide and switches to presentation mode.
 *
 * Buttons dispatch CustomEvents — no reference to any controller or logic.
 */
export default class OverviewView {

    /**
     * @param {HTMLElement[]} slides
     * @param {HTMLElement|null} panelElement
     */
    constructor(slides, panelElement) {
        this._slides = Array.isArray(slides) ? slides : [];
        this._panel  = panelElement instanceof HTMLElement ? panelElement : null;
    }

    // -----------------------------------------------------------------------
    // Called once during init
    // -----------------------------------------------------------------------

    /**
     * Populate the overview panel with one button per slide.
     */
    build() {
        if (this._panel === null) {
            return;
        }

        this._panel.innerHTML = '';

        this._slides.forEach((slide, i) => {
            const index = i + 1;

            const btn = document.createElement('button');
            btn.type      = 'button';
            btn.className = 'overview-btn';

            const numEl = document.createElement('span');
            numEl.className   = 'overview-num';
            numEl.textContent = String(index);

            const titleEl = document.createElement('span');
            titleEl.className   = 'overview-title';
            titleEl.textContent = this._slideTitle(slide);

            btn.appendChild(numEl);
            btn.appendChild(titleEl);

            btn.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('slides:navigate', {
                    detail: { action: 'goTo', index, step: 0 }
                }));
                document.dispatchEvent(new CustomEvent('slides:viewmode', {
                    detail: { mode: 'presentation' }
                }));
            });

            this._panel.appendChild(btn);
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
        this._panel.style.display = data.mode === 'overview' ? '' : 'none';
    }

    // -----------------------------------------------------------------------
    // Private
    // -----------------------------------------------------------------------

    /**
     * Extract the first heading text from a slide, or return empty string.
     * @private
     * @param {HTMLElement} slide
     * @returns {string}
     */
    _slideTitle(slide) {
        const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
        return heading ? heading.textContent.trim() : '';
    }
}
