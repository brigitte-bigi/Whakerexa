/**
:filename: statics.js.video_popup.js
:author: Florian Lopitaux
:contact: contact@sppas.org
:summary: Functions to open the close the video popup.

.. _This file is part of Whakerexa: https://sourceforge.net/projects/whakerexa/ ,
.. on 2024-03-01.
    -------------------------------------------------------------------------

    Copyright (C) 2011-2024  Brigitte Bigi
    Laboratoire Parole et Langage, Aix-en-Provence, France

    Use of this software is governed by the GNU Public License, version 3.

    Whakerexa is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Whakerexa is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Whakerexa. If not, see <https://www.gnu.org/licenses/>.

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

    // add close button
    let button = document.createElement("button");
    button.name = "popup-close-btn";
    button.onclick = () => close_dialog(id_dialog);
    button.innerHTML = "&#10060;";

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
