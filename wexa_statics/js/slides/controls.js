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
     * @param {Object} options - Optional buttons.
     * @param {HTMLElement|null} options.prevButton - Previous slide button.
     * @param {HTMLElement|null} options.nextButton - Next slide button.
     * @param {HTMLElement|null} options.backButton - Back-to-start button.
     */
    constructor(manager, { prevButton = null, nextButton = null, backButton = null }) {
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
    }
}
