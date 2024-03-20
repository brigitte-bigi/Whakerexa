/**
:filename: statics.js.book.js
:author: Brigitte Bigi, Florian Lopitaux
:contact: contact@sppas.org
:summary: A class to filled the table of content.

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


class Book {
    // FIELDS
    #toc_element;
    #headings_container;


    // CONSTRUCTOR
    /**
     * Instantiate the book class.
     *
     * @param id_headings {string} The id of the html element where searched all headings
     * @param id_toc {string} Optional parameter, the id of the html nav of our table of contents
     */
    constructor(id_headings, id_toc = "toc") {
        this.#toc_element = document.getElementById(id_toc);
        this.#headings_container = document.getElementById(id_headings);
    }


    // GETTERS
    /**
     * Get the table of contents html element.
     *
     * @returns {HTMLElement}
     */
    get dom_toc() {
        return this.#toc_element;
    }

    /**
     * Get the html element that contains all headings.
     *
     * @returns {HTMLElement}
     */
    get headings() {
        return this.#headings_container;
    }


    // SETTERS
    /**
     * Set the html element where searched all headings.
     *
     * @param id_headings {string} The id of the html element
     */
    set headings(id_headings) {
        this.#headings_container =  document.getElementById(id_headings);
    }


    // PUBLIC METHODS
    /**
     * Fill the table with all headings.
     */
    fill_table() {
        const headings = this.#get_headings();

        headings.forEach((heading, index) => {
            /* Add the anchor right before the heading */
            let anchor = document.createElement('a');
            anchor.setAttribute("id", 'toc' + index);
            anchor.setAttribute("name", 'toc' + index);

            /* Add an entry into the table of content */
            let link = document.createElement('a');
            link.setAttribute('href', '#toc' + index);
            link.textContent = heading.textContent;

            let item = document.createElement('li');
            item.setAttribute('class', heading.tagName.toLowerCase());

            item.appendChild(link);
            this.#toc_element.appendChild(item);
            heading.parentNode.insertBefore(anchor, heading);
        });
    }


    // PRIVATE METHODS
    /**
     * Searched all headings linked with the table of contents.
     *
     * @returns {Array[HTMLElement]} the headings array
     */
    #get_headings() {
        let titles = [].slice.call(this.#headings_container.querySelectorAll("h1, h2, h3, h4"));
        let headings = [];

        titles.forEach(current => {
            // check if the heading begin by a number
            let before = window.getComputedStyle(current,'::before');

            if (before['content'].includes("counter(")) {
                headings.push(current);
            }
        });

        return headings;
    }
}
