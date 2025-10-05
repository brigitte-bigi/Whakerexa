/**
:filename: statics.js.dialog.js
:author: Brigitte Bigi
:contributor: Florian Lopitaux
:contact: contact@sppas.org
:summary: Functions to open the close the video popup.

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
 * Open a dialog with this identifier. Open in modal mode if the optional parameter is set to true.
 * A modal dialog is a popup which display on the middle screen and prevent the user to interact with the rest of the page.
 *
 * @param id_dialog {string} the identifier of the dialog element.
 * @param is_modal {boolean} if we open the dialog in modal mode or normal mode. False by default.
 */
function open_dialog(id_dialog, is_modal = false) {
    let dialog = document.getElementById(id_dialog);

    // replace hidden class to display the dialog
    dialog.classList.replace("hidden-alert", "hidden-alert-open");

    // add close button
    let button = document.createElement("button");
    button.name = "popup-close-btn";
    button.onclick = () => close_dialog(id_dialog);
    button.innerHTML = "&#10060;";  /* Cross 'X' character */

    dialog.appendChild(button);

    // open the dialog
    if (is_modal) {
        dialog.showModal();
    } else {
        dialog.show();
    }
}

/**
 * Close a dialog (or modal dialog) with this identifier.
 *
 * @param id_dialog {string} the identifier of the dialog element.
 */
function close_dialog(id_dialog) {
    let dialog = document.getElementById(id_dialog);

    // replace hidden class to hide the dialog
    dialog.classList.replace("hidden-alert-open", "hidden-alert");

    // search popup-close-btn and remove it if we find it
    Array.from(dialog.children).forEach(child => {
       if (child.name === "popup-close-btn") {
           child.remove();
       }
    });

    dialog.close();
}

/**
 * Open the video popup and get the video file from the server.
 *
 * @param id_popup {string} The identifier of the video popup node defined in the python code.
 */
async function play_popup_video(id_popup) {
    open_dialog("popup-" + id_popup, true);

    // quick start of the video to the client get the video file
    let video = document.getElementById("popup-video-" + id_popup);
    await video.play();
    video.pause();
}

/**
 * Close the video popup and stop the video.
 *
 * @param id_popup {string} the identifier of the video popup node defined in the python code.
 */
function close_popup_video(id_popup) {
    close_dialog("popup-" + id_popup);

    let video = document.getElementById("popup-video-" + id_popup);
    video.pause();
}

// --------------------------------------------------------------------------
// For a future version
// --------------------------------------------------------------------------

/**
 * @class DialogManager
 * @classdesc
 * Controls HTML <dialog> elements with accessibility, lazy content loading,
 * and basic keyboard handling (Escape to close). Designed for lightweight,
 * independent use in Whakerexa-based websites.
 *
 * Each instance can manage one or more dialogs identified by their IDs.
 * When opened, a dialog becomes modal, centers itself, and can contain
 * dynamically loaded content (e.g. videos, iframes).
 *
 * @example
 * const dialogs = new DialogManager();
 * dialogs.open('videoDialog');   // Opens the dialog with this ID
 * dialogs.close('videoDialog');  // Closes it
 */
class DialogManager {
    #dialogs = new Map();

    /**
     * Register a dialog by its ID.
     * @param {string} dialogId - The ID of the <dialog> element.
     * @returns {void}
     */
    register(dialogId) {
        const dialog = document.getElementById(dialogId);
        if (!dialog) {
            console.warn(`DialogManager: dialog '${dialogId}' not found.`);
            return;
        }
        this.#dialogs.set(dialogId, dialog);
        dialog.addEventListener('keydown', ev => this.#handleKey(ev, dialog));
    }

    /**
     * Open a dialog (modal or not), mirroring legacy behavior:
     * - replace 'hidden-alert' with 'hidden-alert-open'
     * - inject a single close button that calls close()
     *
     * @param {string} dialogId
     * @param {boolean} [isModal=false]
     * @returns {void}
     */
    open(dialogId, isModal = false) {
        const dialog = this.#dialogs.get(dialogId);
        if (!dialog) throw new Error(`DialogManager: '${dialogId}' not registered.`);
        dialog.classList.replace('hidden-alert', 'hidden-alert-open');
        this.#ensureCloseButton(dialog);
        if (isModal && typeof dialog.showModal === 'function') dialog.showModal();
        else if (typeof dialog.show === 'function') dialog.show();
        else dialog.setAttribute('open', '');
    }

    /**
     * Closes a dialog and cleans up its dynamic content if necessary.
     * @param {string} dialogId - The ID of the dialog to close.
     * @returns {void}
     */
    close(dialogId) {
        const dialog = this.#dialogs.get(dialogId);
        if (!dialog) return;
        dialog.classList.replace('hidden-alert-open', 'hidden-alert');
        dialog.close?.();
        this.#resetContent(dialog);
    }

    /**
     * Handles the Escape key to close dialogs.
     * @private
     * @param {KeyboardEvent} ev
     * @param {HTMLDialogElement} dialog
     */
    #handleKey(ev, dialog) {
        if (ev.key === 'Escape') {
            ev.preventDefault();
            this.close(dialog.id);
        }
    }

    /**
     * Clears media content (e.g. video, iframe) inside the dialog to free resources.
     * @private
     * @param {HTMLDialogElement} dialog
     */
    #resetContent(dialog) {
        dialog.querySelectorAll('video, iframe').forEach(el => {
            el.pause?.();
            el.removeAttribute('src');
            el.load?.();
        });
    }

    /** @private */
    #ensureCloseButton(dialog) {
        if (dialog.querySelector('button[name="popup-close-btn"]')) return;
        const btn = document.createElement('button');
        btn.name = 'popup-close-btn';
        btn.type = 'button';
        btn.innerHTML = '&#10060;';
        btn.addEventListener('click', () => this.close(dialog.id));
        dialog.appendChild(btn);
    }

}


