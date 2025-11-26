import SlidesView from './slides_view.js';

/**
 :filename: statics.js.slides.controls.js
 :author: Brigitte Bigi
 :contact: contact@sppas.org
 :summary: Manages optional navigation buttons.

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
 * SlidesControlsController manages all navigation buttons.
 *
 * It owns a FEATURE → BUTTON mapping and exposes methods
 * to enable/disable features.
 */
export default class SlidesControlsController {

    /**
     * @param {Object} manager - SlidesManager instance.
     * @param {Object} config
     * @param {HTMLElement|null} [config.prevButton]
     * @param {HTMLElement|null} [config.nextButton]
     * @param {HTMLElement|null} [config.backButton]
     * @param {HTMLElement|null} [config.lastButton]
     * @param {HTMLElement|null} [config.overviewButton]
     * @param {HTMLElement|null} [config.presentationButton]
     * @param {HTMLElement|null} [config.fullscreenButton]
     * @param {HTMLElement|null} [config.goToButton]
     */
    constructor(manager, {
        prevButton = null,
        nextButton = null,
        backButton = null,
        lastButton = null,
        overviewButton = null,
        presentationButton = null,
        fullscreenButton = null,
        goToButton = null
    } = {}) {

        if (typeof manager !== 'object' || manager === null) {
            throw new Error('SlidesControlsController: "manager" must be an object.');
        }
        this._manager = manager;

        /**
         * Internal FEATURE → BUTTON mapping.
         *
         * @private
         * @type {Object.<string, HTMLElement|null>}
         */
        this._buttons = {
            prev: this._elementOrNull(prevButton),
            next: this._elementOrNull(nextButton),
            back: this._elementOrNull(backButton),
            last: this._elementOrNull(lastButton),
            overview: this._elementOrNull(overviewButton),
            presentation: this._elementOrNull(presentationButton),
            fullscreen: this._elementOrNull(fullscreenButton),
            goto: this._elementOrNull(goToButton)
        };

        this._bindEvents();
    }

    // ----------------------------------------------------------------------

    /**
     * Bind click handlers for all known buttons.
     *
     * @private
     * @returns {void}
     */
    _bindEvents() {
        const b = this._buttons;

        if (b.prev !== null) {
            b.prev.addEventListener('click', () => {
                this._manager.prev();
            });
        }

        if (b.next !== null) {
            b.next.addEventListener('click', () => {
                this._manager.next();
            });
        }

        if (b.back !== null) {
            b.back.addEventListener('click', () => {
                this._manager.goStart();
            });
        }

        if (b.last !== null) {
            b.last.addEventListener('click', () => {
                this._manager.goEnd();
            });
        }

        if (b.goto !== null) {
            b.goto.addEventListener('click', () => {
                const index = window.prompt('Go to slide number: ');
                if (index !== null) {
                    // If currently in overview mode, switch to presentation first
                    if (this._manager._view?.mode === SlidesView.MODES.OVERVIEW) {
                        this._switchView(SlidesView.MODES.PRESENTATION);
                    }
                    this._manager.goTo(Number(index), 0);
                }
            });
        }

        if (b.overview !== null) {
            b.overview.addEventListener('click', () => {
                this._switchView(SlidesView.MODES.OVERVIEW);
            });
        }

        if (b.presentation !== null) {
            b.presentation.addEventListener('click', () => {
                this._switchView(SlidesView.MODES.PRESENTATION);
            });
        }

        if (b.fullscreen !== null) {
            b.fullscreen.addEventListener('click', () => {
                if (this._manager._fullscreen &&
                    typeof this._manager._fullscreen.toggle === 'function') {
                    this._manager._fullscreen.toggle();
                }
            });
        }
    }

    // ----------------------------------------------------------------------

    /**
     * Disable all registered controls.
     *
     * @returns {void}
     */
    disableAll() {
        for (const key in this._buttons) {
            if (!Object.prototype.hasOwnProperty.call(this._buttons, key)) {
                continue;
            }
            const btn = this._buttons[key];
            if (btn instanceof HTMLElement) {
                btn.setAttribute('disabled', '');
            }
        }
    }

    // ----------------------------------------------------------------------

    /**
     * Enable a specific feature control.
     *
     * This method does NOT automatically disable other features.
     * Call disableAll() first when you want a single active control.
     *
     * @param {string} feature - One of the known feature names.
     * @returns {void}
     */
    enable(feature) {
        if (typeof feature !== 'string') {
            return;
        }

        const btn = this._buttons[feature];
        if (btn instanceof HTMLElement) {
            btn.removeAttribute('disabled');
        }
    }

    // ----------------------------------------------------------------------

    /**
     * Switch view mode and update UI controls accordingly.
     * Only UI state changes happen here; logic is delegated to the manager.
     *
     * @param {string} viewMode - A SlidesView.MODES.* value.
     */
    _switchView(viewMode) {

        // Update the two view-mode buttons (overview / presentation)
        const viewButtons = ['overview', 'presentation'];
        for (const name of viewButtons) {
            const btn = this._buttons[name];
            if (!btn) continue;

            // Disable the button matching the current view mode
            // Enable the other one
            if (name === viewMode) {
                btn.setAttribute('disabled', '');
            } else {
                btn.removeAttribute('disabled');
            }
        }

        // Update navigation buttons depending on the view mode
        if (viewMode === 'overview') {

            // In overview mode, classic navigation (prev/next/back/last) is irrelevant
            for (const name of ['prev','next','back','last']) {
                const btn = this._buttons[name];
                if (btn) btn.setAttribute('disabled', '');
            }

            // goto + fullscreen always remain available in overview
            for (const name of ['goto','fullscreen']) {
                const btn = this._buttons[name];
                if (btn) btn.removeAttribute('disabled');
            }

        } else {

            // In presentation mode, all navigation buttons are enabled
            for (const name of ['prev','next','back','last','goto','fullscreen']) {
                const btn = this._buttons[name];
                if (btn) btn.removeAttribute('disabled');
            }
        }

        // Trigger the actual view-mode change in the manager
        this._manager.setViewMode(viewMode);
    }


    // ----------------------------------------------------------------------

    /**
     * Utility: normalize an element reference.
     *
     * @private
     * @param {*} element
     * @returns {HTMLElement|null}
     */
    _elementOrNull(element) {
        return element instanceof HTMLElement ? element : null;
    }
}
