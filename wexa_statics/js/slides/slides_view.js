/**
 :filename: statics.js.slides.slides_view.js
 :author: Brigitte Bigi
 :contact: contact@sppas.org
 :summary: Visual rendering for slide transitions, incremental items and progress bar.

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
 * SlidesView is responsible for display only. It never decides navigation.
 * It receives state from SlidesManager and updates the DOM accordingly.
 */
export default class SlidesView {

    /**
     * Create the visual view.
     *
     * @param {HTMLElement[]} slides - List of slide elements, already validated by the Slides facade.
     * @param {HTMLElement|null} progressBar - Optional progress bar inner element.
     * @param {HTMLElement|null} controlsElement - Global controls' element.
     */
    constructor(slides, progressBar = null, controlsElement = null) {
        this._slides = slides;
        this._progressBar = progressBar;
        this._controls = controlsElement;

        this._viewMode = false;               // true = overview active
        this._overviewContainer = null;       // <div id="overview-container">
        this._overviewGrid = null;            // <div id="overview-grid">

        /**
         * Callback to notify the controller when a slide card is clicked
         * in overview mode.
         * Signature: onSelectSlide(index : number)
         */
        this.onSelectSlide = null;
    }

    /**
     * Initialize the view structure.
     * Sets up overview containers and builds the overview grid.
     */
    init() {
        this._initOverviewElements();
        this._buildOverview();
    }

    /**
     * Bind DOM elements used by overview mode.
     *
     * HTML must contain:
     *   <div id="overview-container">
     *     <div id="overview-grid"></div>
     *   </div>
     */
    _initOverviewElements() {
        this._overviewContainer = document.getElementById('overview-container');
        this._overviewGrid = document.getElementById('overview-grid');

        if (this._overviewContainer instanceof HTMLElement) {
            this._overviewContainer.style.display = 'none';   // hidden by default
        }
    }

    /**
     * Build the overview grid by cloning each slide content.
     * Each slide becomes a clickable overview "card".
     */
    _buildOverview() {
        if (!(this._overviewGrid instanceof HTMLElement)) {
            return;
        }

        this._overviewGrid.innerHTML = '';

        this._slides.forEach((slide, index) => {
            const card = document.createElement('div');
            card.className = 'slide-card';

            // Clone visible HTML content (not deep-clone DOM)
            card.innerHTML = slide.innerHTML;

            card.addEventListener('click', () => {
                if (typeof this.onSelectSlide === 'function') {
                    this.onSelectSlide(index + 1);
                }
                this.setOverview(false);
            });

            this._overviewGrid.appendChild(card);
        });
    }

    /**
     * Render the selected slide.
     *
     * @param {number} newIndex  - New visible slide (1-based).
     * @param {number} oldIndex  - Previously visible slide (1-based).
     */
    renderSlide(newIndex, oldIndex) {
        if (oldIndex >= 1 && oldIndex <= this._slides.length) {
            const prev = this._slides[oldIndex - 1];
            if (prev instanceof HTMLElement) {
                prev.removeAttribute('aria-selected');
            }
        }

        if (newIndex >= 1 && newIndex <= this._slides.length) {
            const curr = this._slides[newIndex - 1];
            if (curr instanceof HTMLElement) {
                curr.setAttribute('aria-selected', 'true');
            }
        }
    }

    /**
     * Render incremental items of a slide.
     *
     * @param {number} currentIndex - Slide index (1-based).
     * @param {number} step         - Incremental step index (0 = none).
     */
    renderIncremental(currentIndex, step) {
        const slide = this._getSlide(currentIndex);
        if (slide === null) {
            return;
        }

        // reset all containers + items
        const containers = slide.querySelectorAll('.incremental');
        containers.forEach(container => this._clearIncrementals(container));

        if (step === 0) {
            return;
        }

        const items = slide.querySelectorAll('.incremental > *');
        const count = items.length;
        if (count === 0 || step > count) {
            return;
        }

        const target = items[step - 1];
        const parent = target.parentElement;

        if (parent instanceof HTMLElement) {
            parent.setAttribute('active', 'true');   // same convention as your earlier version
        }
        target.setAttribute('aria-selected', 'true');
    }

    /**
     * Update progress bar width (%).
     *
     * @param {number} widthPercent - Range 0–100.
     */
    renderProgress(widthPercent) {
        if (this._progressBar instanceof HTMLElement) {
            this._progressBar.style.width = String(widthPercent) + '%';
        }
    }

    /**
     * Show or hide the controls panel.
     *
     * @param {boolean} visible - true = controls mode ON, false = OFF.
     */
    renderControls(visible) {
        console.debug(visible);
        if (this._controls === null) {
            console.info("Controls can't be enabled/disabled: No controls found!");
            return;
        }
        this._controls.classList.toggle('controls-hidden', visible === false);
    }

    /**
     * Enable or disable overview mode.
     *
     * @param {boolean} active - true = overview mode ON, false = OFF.
     */
    setOverview(active) {
        this._viewMode = active;

        if (!(this._overviewContainer instanceof HTMLElement)) {
            return;
        }

        this._overviewContainer.style.display = active ? 'block' : 'none';

        // Hide normal slides during overview
        this._slides.forEach(slide => {
            if (slide instanceof HTMLElement) {
                slide.style.display = active ? 'none' : 'block';
            }
        });
    }

    /**
     * @returns {boolean} true if overview mode is active.
     */
    get isOverview() {
        return this._viewMode;
    }

    // ---------------------------------------------------------------------
    // Private helper utilities
    // ---------------------------------------------------------------------

    /**
     * Reset incremental visual markers in a container.
     *
     * @param {HTMLElement} container
     * @private
     */
    _clearIncrementals(container) {
        if (!(container instanceof HTMLElement)) {
            return;
        }

        container.removeAttribute('active');

        const items = container.querySelectorAll('*');
        items.forEach(item => {
            item.removeAttribute('aria-selected');
        });
    }

    /**
     * Safe slide getter.
     *
     * @param {number} index - 1-based slide index.
     * @returns {HTMLElement|null}
     * @private
     */
    _getSlide(index) {
        if (index < 1 || index > this._slides.length) {
            return null;
        }
        return this._slides[index - 1];
    }
}
