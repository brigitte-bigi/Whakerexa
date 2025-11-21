/**
 :filename: statics.js.slides.keyboard.js
 :author: Brigitte Bigi
 :contact: contact@sppas.org
 :summary: Keyboard and button navigation controller for slides.

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
 * This controller handles all *user-triggered navigation inputs* except touch:
 * - keyboard (left, right, up, down, pageUp, pageDown, home, end, space)
 * - optional buttons: next, prev, backToStart
 *
 * No visual logic. No state. Delegates everything to SlidesManager.
 */
export default class SlidesKeyboardAndButtonsController {
    /**
     * @param {Object} slidesManager - Instance of SlidesManager.
     * @param {Object} [options] - Optional configuration.
     * @param {HTMLElement|null} [options.nextButton] - "Next" button.
     * @param {HTMLElement|null} [options.prevButton] - "Previous" button.
     * @param {HTMLElement|null} [options.backButton] - "Back to start" button.
     */
    constructor(slidesManager, options = {}) {
        if (typeof slidesManager !== 'object' || slidesManager === null) {
            throw new Error('SlidesKeyboardAndButtonsController: "slidesManager" must be an object.');
        }

        this._manager = slidesManager;

        this._nextButton = this._elementOrNull(options.nextButton);
        this._prevButton = this._elementOrNull(options.prevButton);
        this._backButton = this._elementOrNull(options.backButton);

        this._boundKeyHandler = this._onKeyDown.bind(this);
    }

    /**
     * Activate listeners.
     *
     * @returns {void}
     */
    init() {
        window.addEventListener('keydown', this._boundKeyHandler, false);
        this._attachButtons();
    }

    /**
     * Remove listeners (optional cleanup).
     *
     * @returns {void}
     */
    destroy() {
        window.removeEventListener('keydown', this._boundKeyHandler, false);
        this._detachButtons();
    }

    // ---------------------------------------------------------------------
    // Keyboard handling
    // ---------------------------------------------------------------------

    /**
     * Handle keydown events.
     *
     * @param {KeyboardEvent} event - Keyboard event.
     * @private
     * @returns {void}
     */
    _onKeyDown(event) {
        if (event.altKey || event.ctrlKey || event.metaKey) {
            return;
        }
        const dialog = document.querySelector('dialog[open]');
        if (dialog instanceof HTMLElement) {
            return;  // A modal dialog is open → ignore slide navigation
        }

        const key = event.keyCode;

        // Overview
        if (event.key === 'o' || event.key === 'O') {
            console.debug("== Keyboard for overview ==")
            this._manager.toggleOverview();
        }

        // Full screen
        if (event.key === 'f' || event.key === 'F') {
            console.debug("== Keyboard for fullscreen ==")
            this._manager.toggleFullscreen();
        }

        // Controls panel
        if (event.key === 'n' || event.key === 'N') {
            console.debug("== Keyboard for controls panel ==")
            this._manager.toggleControls();
        }

        // Left / Up / PageUp
        if (key === 37 || key === 38 || key === 33) {
            event.preventDefault();
            this._manager.prev();
            return;
        }

        // Right / Down / PageDown
        if (key === 39 || key === 40 || key === 34) {
            event.preventDefault();
            this._manager.next();
            return;
        }

        // Home
        if (key === 36) {
            event.preventDefault();
            this._manager.goStart();
            return;
        }

        // End
        if (key === 35) {
            event.preventDefault();
            this._manager.goEnd();
            return;
        }

        // Space = toggle content (video play/pause)
        if (key === 32) {
            event.preventDefault();
            this._manager.toggleContent();
            return;
        }

    }

    // ---------------------------------------------------------------------
    // Buttons
    // ---------------------------------------------------------------------

    /**
     * Attach click listeners to configured buttons.
     *
     * @private
     * @returns {void}
     */
    _attachButtons() {
        if (this._nextButton !== null) {
            this._nextButton.addEventListener('click', () => {
                this._manager.next();
            });
        }

        if (this._prevButton !== null) {
            this._prevButton.addEventListener('click', () => {
                this._manager.prev();
            });
        }

        if (this._backButton !== null) {
            this._backButton.addEventListener('click', () => {
                this._manager.goStart();
            });
        }
    }

    /**
     * Detach click listeners (cleanup).
     *
     * @private
     * @returns {void}
     */
    _detachButtons() {
        if (this._nextButton !== null) {
            this._nextButton.replaceWith(this._nextButton.cloneNode(true));
        }

        if (this._prevButton !== null) {
            this._prevButton.replaceWith(this._prevButton.cloneNode(true));
        }

        if (this._backButton !== null) {
            this._backButton.replaceWith(this._backButton.cloneNode(true));
        }
    }

    // ---------------------------------------------------------------------
    // Utils
    // ---------------------------------------------------------------------

    /**
     * Normalize an element reference.
     *
     * @param {*} element - Input value.
     * @private
     * @returns {HTMLElement|null}
     */
    _elementOrNull(element) {
        return element instanceof HTMLElement ? element : null;
    }
}
