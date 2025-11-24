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



/**
 * It binds click events on the provided buttons and delegates
 * all navigation actions to the SlidesManager instance.
 *
 * @class SlidesControlsController
 */
export default class SlidesControlsController {

    /**
     * @param {SlidesManager} manager - Slides logic controller.
     * @param {HTMLElement|null} prevButton - Previous slide button.
     * @param {HTMLElement|null} nextButton - Next slide button.
     * @param {HTMLElement|null} backButton - Back-to-start button.
     * @param {HTMLElement|null} lastButton - Go-to-last button.
     * @param {HTMLElement|null} overviewButton - Overview button.
     * @param {HTMLElement|null} fullscreenButton - Fullscreen button.
     * @param {HTMLElement|null} goToButton - go to slide button.
     */
    constructor(manager, {
        prevButton = null,
        nextButton = null,
        backButton = null,
        lastButton =null,
        overviewButton = null,
        fullscreenButton = null,
        goToButton = null
    }) {
        this._manager = manager;

        if (prevButton !== null) {
            prevButton.addEventListener('click', () => {
                this._manager.prev();
            });
        }

        if (nextButton !== null) {
            nextButton.addEventListener('click', () => {
                this._manager.next();
            });
        }

        if (backButton !== null) {
            backButton.addEventListener('click', () => {
                this._manager.goStart();
            });
        }

        if (lastButton !== null) {
            lastButton.addEventListener('click', () => {
                this._manager.goEnd();
            });
        }

        if (goToButton !== null) {
            goToButton.addEventListener('click', () => {
                const index = window.prompt('Go to slide number:');
                if (index !== null) {
                    this._manager.goTo(Number(index), 0);
                }
            });
        }

        if (overviewButton !== null) {
            overviewButton.addEventListener('click', () => {
                this._manager.toggleOverview();
            });
        }

        if (fullscreenButton !== null) {
            fullscreenButton.addEventListener('click', () => {
                this._manager._fullscreen.toggle();
            });
        }

    }
}
