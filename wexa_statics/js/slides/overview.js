/**
 :filename: statics.js.slides.overview.js
 :author: Brigitte Bigi
 :contact: contact@sppas.org
 :summary: Build and control the overview panel.

 -------------------------------------------------------------------------

 This file is part of Whakerexa: https://whakerexa.sf.net/

 Copyright (C) 2023-2025 Brigitte Bigi, CNRS
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
 * The overview displays a list of slide copies.
 * Each item contains: <header> number, <main> clone, <footer> GoTo button.
 *
 * Cloned slides are visually identical but non-interactive.
 */
export default class SlidesOverview {
    /**
     * @constructor
     * @param {HTMLElement} panelElement - The <section> used as overview panel.
     */
    constructor(panelElement, onSelectSlide) {
        /** @private @type {HTMLElement|null} */
        this._panel = panelElement instanceof HTMLElement ? panelElement : null;

        /** @private @type {function(number):void|null} */
        this._onSelectSlide = typeof onSelectSlide === 'function' ? onSelectSlide : null;

        if (this._panel !== null) {
            this._panel.style.display = 'none'; // hidden by default
        }
    }

    /**
     * Build the overview content:
     * - Clear panel
     * - For each slide DOM element, build an article:
     *   <article class="overview-item">
     *     <header>n</header>
     *     <main>[cloneNode(true)]</main>
     *     <footer><button>GoTo</button></footer>
     *   </article>
     *
     * @param {HTMLElement[]} slidesDomList - Ordered list of slide DOM elements.
     * @returns {void}
     */
    build(slidesDomList) {
        if (this._panel === null) {
            return;
        }

        this._panel.innerHTML = '';

        for (let i = 0; i < slidesDomList.length; i++) {
            const slide = slidesDomList[i];
            const index = i + 1;

            // <article>
            const article = document.createElement('article');
            article.className = 'overview-item';

            // <header>
            const header = document.createElement('header');
            header.textContent = String(index);
            article.appendChild(header);

            // <main>
            const main = document.createElement('main');
            const clone = slide.cloneNode(true);
            main.appendChild(clone);
            article.appendChild(main);

            // <footer> with GoTo button
            const footer = document.createElement('footer');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = 'GoTo';

            btn.addEventListener('click', () => {
                if (typeof this._onSelectSlide === 'function') {
                    this._onSelectSlide(index);
                }
                this.hide();
            });

            footer.appendChild(btn);
            article.appendChild(footer);

            // Insert article in panel
            this._panel.appendChild(article);
        }
    }

    /**
     * Show the overview panel.
     * @returns {void}
     */
    show() {
        if (this._panel !== null) {
            this._panel.style.display = 'block';
        }
    }

    /**
     * Hide the overview panel.
     * @returns {void}
     */
    hide() {
        if (this._panel !== null) {
            this._panel.style.display = 'none';
        }
    }
}
