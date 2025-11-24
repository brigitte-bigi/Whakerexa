import SlidesView from './slides_view.js';

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
 * Keyboard & button controller.
 *
 * PURE INPUT LAYER:
 * - no visual logic
 * - no mode logic
 * - no validation logic
 * - always delegates to SlidesManager
 *
 * Manager is free to expose:
 *   next()
 *   prev()
 *   goStart()
 *   goEnd()
 *   toggleContent()
 *   setViewMode()
 *   toggleFullscreen()
 *   toggleControls()
 *   ...
 *
 * This controller *never* decides what these actions mean.
 */
export default class SlidesKeyboardAndButtonsController {

    // ----------------------------------------------------------------------
    // CONSTRUCTOR
    // ----------------------------------------------------------------------

    /**
     * @param {Object} slidesManager - Instance of SlidesManager.
     * @param {HTMLElement} container - The slide container; required. All keyboard
     *   events must be captured ONLY inside this container.
     * @param {Object} [options] - Optional configuration.
     * @param {HTMLElement|null} [options.nextButton] - "Next" button.
     * @param {HTMLElement|null} [options.prevButton] - "Previous" button.
     * @param {HTMLElement|null} [options.backButton] - "Back to start" button.
     */
    constructor(slidesManager, container, options = {}) {
        if (typeof slidesManager !== 'object' || slidesManager === null) {
            throw new Error('SlidesKeyboardAndButtonsController: "slidesManager" must be an object.');
        }
        if (!(container instanceof HTMLElement)) {
            throw new Error('SlidesKeyboardAndButtonsController: "container" must be an HTMLElement.');
        }

        this._manager = slidesManager;
        this._container = container;

        this._nextButton = this._elementOrNull(options.nextButton);
        this._prevButton = this._elementOrNull(options.prevButton);
        this._backButton = this._elementOrNull(options.backButton);

        this._boundKeyHandler = this._onKeyDown.bind(this);
    }

    // ----------------------------------------------------------------------
    // INITIALIZATION
    // ----------------------------------------------------------------------

    /**
     * Activate listeners.
     *
     * @returns {void}
     */
    init() {
        this._container.addEventListener('keydown', this._boundKeyHandler, false);
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
     * @param {KeyboardEvent} event
     * @private
     * @returns {void}
     */
    _onKeyDown(event) {
        console.debug('onKeyDown', event);
        if (event.altKey || event.ctrlKey || event.metaKey) {
            return;
        }

        const dialog = document.querySelector('dialog[open]');
        if (dialog instanceof HTMLElement) {
            return;
        }

        const key = event.key;

        switch (key) {
            default:
                return;

            // Switch to the default view mode
            case 'Escape':
                this._manager.setViewMode?.(SlidesView.DEFAULT_MODE);
                return;

            // Switch to Presentation mode
            case 's':
            case 'S':
                this._manager.setViewMode?.(SlidesView.MODES.PRESENTATION);
                return;

            // Switch to Overview mode
            case 'o':
            case 'O':
                this._manager.setViewMode?.(SlidesView.MODES.OVERVIEW);
                return;

            // Fullscreen toggle
            case 'f':
            case 'F':
                this._manager.toggleFullscreen?.();
                return;

            // Controls panel toggle
            case 'n':
            case 'N':
                this._manager.toggleControls?.();
                return;

            // Navigation backward
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                event.preventDefault();
                this._manager.prev();
                return;

            // Navigation forward
            case 'ArrowRight':
            case 'ArrowDown':
            case 'PageDown':
                event.preventDefault();
                this._manager.next();
                return;

            // Home
            case 'Home':
                event.preventDefault();
                this._manager.goStart();
                return;

            // End
            case 'End':
                event.preventDefault();
                this._manager.goEnd();
                return;

            // Space = toggle content (video)
            case ' ':
                event.preventDefault();
                this._manager.toggleContent();
                return;

        }
    }

    // ---------------------------------------------------------------------
    // Buttons
    // ---------------------------------------------------------------------

    /** @private */
    _attachButtons() {
        if (this._nextButton !== null) {
            this._nextButton.addEventListener('click', () => this._manager.next());
        }

        if (this._prevButton !== null) {
            this._prevButton.addEventListener('click', () => this._manager.prev());
        }

        if (this._backButton !== null) {
            this._backButton.addEventListener('click', () => this._manager.goStart());
        }
    }

    // ---------------------------------------------------------------------

    /** @private */
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
     * @param {*} element
     * @private
     * @returns {HTMLElement|null}
     */
    _elementOrNull(element) {
        return element instanceof HTMLElement ? element : null;
    }
}

