import SlidesManager from './slides_manager.js';
import SlidesView from './slides_view.js';
import SlidesFocusController from './focus.js';
import SlidesKeyboardAndButtonsController from './keyboard.js';
import SlidesTouchController from './touch.js';
import SlidesFullscreenController from './fullscreen.js';

/**
 :filename: statics.js.slides.slides_app.js
 :author: Brigitte Bigi
 :contact: contact@sppas.org
 :summary: Composition root for the Slides module.

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
 * SlidesApp instantiates and wires all internal components:
 * - SlidesManager
 * - SlidesView
 * - SlidesFocusController
 * - SlidesKeyboardAndButtonsController
 * - SlidesTouchController
 * - SlidesFullscreenController
 *
 * No logic. No UI. No navigation.
 * Its sole purpose is to assemble the module cleanly.
 */
export default class SlidesApp {
    /**
     * @param {Object} config - All external inputs needed for instantiation.
     * @param {HTMLElement[]} config.slides - Array of <section class="slide">.
     * @param {HTMLElement|null} config.progressBar - Progress bar inner element.
     * @param {HTMLElement|null} [config.nextButton] - Optional "next" button.
     * @param {HTMLElement|null} [config.prevButton] - Optional "previous" button.
     * @param {HTMLElement|null} [config.backButton] - Optional "back-to-start" button.
     * @param {boolean} [config.autoPlayEnabled=false] - Video autoplay.
     * @param {boolean} [config.viewMode=false] - Initial overview mode.
     */

    /**
     * @param {Object} config
     *   - slides: HTMLElement[]
     *   - progressBar: HTMLElement|null
     */
    constructor(config) {

        /** @private */
        this._view = new SlidesView(
            config.slides,
            config.progressBar
        );

        /** @private */
        this._fullscreen = new SlidesFullscreenController();

        /** @private */
        this._manager = new SlidesManager(
            config.slides,
            {},    // options
            { // dependencies
                view: this._view,
                fullscreen: this._fullscreen
            }
        );

        /** @private */
        this._keyboard = new SlidesKeyboardAndButtonsController(this._manager);
        /** @private */
        this._touch = new SlidesTouchController(this._manager);

        // MVC: View emits → Manager handles
        this._view.onSelectSlide = (index) => {
            this._manager.goTo(index, 0);
        };
    }

    /**
     * Initialize all sub-modules.
     */
    init() {
        this._view.init();
        this._view.setOverview(false);
        this._manager.init();
        this._keyboard.init();
        this._touch.init();
    }

    /** @returns {SlidesManager} */
    get manager() {
        return this._manager;
    }

    /** @returns {SlidesKeyboardAndButtonsController} */
    get keyboard() {
        return this._keyboard;
    }

    /** @returns {SlidesTouchController} */
    get touch() {
        return this._touch;
    }

    /** @returns {SlidesFullscreenController} */
    get fullscreen() {
        return this._fullscreen;
    }
}