import SlidesManager from './slides_manager.js';
import SlidesView from './slides_view.js';
import SlidesFocusController from './focus.js';
import SlidesKeyboardAndButtonsController from './keyboard.js';
import SlidesTouchController from './touch.js';
import SlidesFullscreenController from './fullscreen.js';
import SlidesControlsController from './controls.js';
import SlidesVisibilityManager from './visibility_manager.js';
import SlidesViewModeManager from "./modeview.js";

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
 * @param {Object} config - All external inputs needed for instantiation.
 * @param {HTMLElement[]} config.slides - Array of <section class="slide">.
 * @param {HTMLElement|null} config.progressBar - Progress bar inner element.
 * @param {HTMLElement|null} config.controls - Slides controls element.
 * @param {HTMLElement|null} config.controlsView - Container element for view control.
 * @param {HTMLElement|null} config.overviewContainer - Overview container element.
 * @param {boolean} [config.autoPlayEnabled=false] - Video autoplay.
 * @param {boolean} [config.viewMode="presentation"] - Initial view mode name.
 */
export default class SlidesApp {

    // ----------------------------------------------------------------------
    // CONSTRUCTOR
    // ----------------------------------------------------------------------

    /**
     * @param {Object} config
     *   - slides: HTMLElement[]
     *   - progressBar: HTMLElement|null
     */
    constructor(config) {

        // ****** VIEWS ******
        // -------------------

        /** @private */
        this._view = new SlidesView(
            config.slides,
            config.progressBar,
            config.controls,
            config.controlsView,
            config.overviewContainer
        );

        // ****** CONTROLLERS ******
        // -------------------------

        /** @private */
        this._fullscreen = new SlidesFullscreenController();

        /** @private */
        this._focusController = new SlidesFocusController();

        // ****** MANAGERS ******
        // -------------------------

        /** @private */
        this._visibilityManager = new SlidesVisibilityManager({
            controls: config.controls instanceof HTMLElement ? config.controls : null
        });

        /** @private */
        this._manager = new SlidesManager(
            config.slides,
            {
                autoPlayEnabled: false,
                controlsVisible: true
            },
            { // dependencies
                view: this._view,
                fullscreen: this._fullscreen,
                focusController: this._focusController,
                visibilityManager: this._visibilityManager
            }
        );

        /** @private */
        this._touch = new SlidesTouchController(this._manager);

        /** @private */
        this._keyboard = new SlidesKeyboardAndButtonsController(this._manager);

        /** @private */
        this._controls = new SlidesControlsController(
            this._manager,
            {
                prevButton: config.controls?.querySelector('#btn-prev') || null,
                nextButton: config.controls?.querySelector('#btn-next') || null,
                backButton: config.controls?.querySelector('#btn-back') || null,
                lastButton:  config.controls?.querySelector('#btn-last')  || null,
                goToButton: config.controls?.querySelector('#btn-goto') || null,
                overviewButton: config.controlsView?.querySelector('#btn-overview')  || null,
                presentationButton: config.controlsView?.querySelector('#btn-presentation')  || null,
                fullscreenButton: config.controls?.querySelector('#btn-fullscreen')|| null
            }
        );

        // ********** VIEWS INITIALIZATIONS *********
        // ------------------------------------------

        // MVC: View emits → Manager handles
        this._view.onSelectSlide = (index) => {
            this._manager.goTo(index, 0);
        };

        // Normalize initial mode safely
        this._initialViewMode = SlidesView.MODES.PRESENTATION;
        if (typeof config.mode === 'string') {
            const values = Object.values(SlidesView.MODES);
            if (values.includes(config.mode)) {
                this._initialViewMode = config.mode;
            }
        }

        // Initialize overview only if an overview container is provided
        if (this._view && config.overviewContainer) {
            this._view.initOverview((index) => this._manager.goTo(index, 0));
        }

        // ***** VIEW !!! ******
        /** @private */
        this._viewModeManager = new SlidesViewModeManager(this._view, this._controls);
        this._manager.viewModeManager = this._viewModeManager;
        this._manager.init();
        this._viewModeManager.set(this._initialViewMode);

    }

    // ----------------------------------------------------------------------
    // INITIALIZATION
    // ----------------------------------------------------------------------

    /**
     * Initialize all submodules.
     */
    init() {
        this._view.buildOverview();
        this._view.setMode(this._initialViewMode);
        this._manager.init();
        this._keyboard.init();
        this._touch.init();
    }

    // ----------------------------------------------------------------------
    //  Public API
    // ----------------------------------------------------------------------

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