/**
:filename: statics.js.accessibility.js
:author: Florian Lopitaux
:contact: contact@sppas.org
:summary: Functions to manage the color theme and contrast of the client with data persistent by url parameters.

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

const COLOR_SCHEME = ["dark"]
const CONTRAST_SCHEME = ["contrast"]

// -----------------------------------------------------------------------


/**
 * Loads body css classes to set the color and contrast scheme of the webapp.
 * This function has to be called in the 'onload' property of the body element.
 *
 * By default, the color scheme is set to 'light' and the contrast is disabled.
 */
function loadBodyClasses() {
    const params = new URLSearchParams(window.location.search);
    let body = document.body;

    // manage color scheme
    if (params.has("wexa_color")) {
        const color_parameter = params.get("wexa_color").toLowerCase();

        if (COLOR_SCHEME.includes(color_parameter)) {
            body.classList.add(color_parameter);
        } else {
            console.log("'wexa_color' get parameter unknown : " + color_parameter);
        }
    }

    // manage contrast scheme
    if (params.has("wexa_contrast")) {
        const contrast_param = params.get("wexa_contrast").toLowerCase();

        if  (CONTRAST_SCHEME.includes(contrast_param)) {
            body.classList.add(contrast_param);
        } else {
            console.log("'wexa_contrast' get parameter unknown : " + contrast_param);
        }
    }
}

// add loadBodyClasses in the onLoad events list
OnLoadManager.addLoadFunction(loadBodyClasses);

// -----------------------------------------------------------------------

/**
 * Changes the color scheme of the webapp.
 * Values switched : 'light' <=> 'dark'.
 * Possible functions deprecated in the future if we implement more color scheme.
 */
function color_scheme_switch() {
    let body = document.body;

    if (body.classList.contains("dark")) {
        body.classList.remove("dark");
    } else {
        body.classList.add("dark");
    }
}

// -----------------------------------------------------------------------

/**
 * Changes the contrast scheme of the webapp.
 * Values switched : '' <=> 'sp-contrast'.
 * Possible functions deprecated in the future if we implement more contrast scheme.
 */
function contrast_scheme_switch() {
    let body = document.body;

    // switch contrast scheme
    if (body.classList.contains("contrast")) {
        body.classList.remove("contrast")
    } else {
        body.classList.add("contrast")
    }
}

// -----------------------------------------------------------------------

/**
 * Customs the link before redirect the client.
 *
 * If the link target an external server, nothing changes.
 * If the link target a resource of our server, apply get parameters for the color and contrast scheme.
 *
 * @param element The 'a' html element which contains the url to custom
 */
function goToLink(element) {
    // check if it's an external link to another server
    if (element.host !== window.location.host) {
        document.location.href = element.href;
        return;
    }

    // it's an internal link, we add get parameters for the color and contrast scheme
    let custom_url = new URL(element.href);

    // search whakerexa body classes
    document.body.classList.forEach(element => {
        // check color schemes
        if (COLOR_SCHEME.includes(element)) {
            custom_url.searchParams.set("wexa_color", element);
        }

        // check contrast scheme
        if (CONTRAST_SCHEME.includes(element)) {
            custom_url.searchParams.set("wexa_contrast", element);
        }
    });

    // set the new url to redirect the client
    document.location.href = custom_url.href;
}

// -----------------------------------------------------------------------

/**
 * Custom the click event of all 'a' html element to call the goToLink function.
 */
function setAllLinksCustom() {
    let link_elements = Array.from(document.querySelectorAll("a"));

    link_elements.forEach(element => {
        element.addEventListener("click", event => {
            event.preventDefault();
            goToLink(element);
        });
    });
}

// add setAllLinksCustom in the onLoad events list
OnLoadManager.addLoadFunction(setAllLinksCustom);
