/**
 :filename: wexa_statics/js/extras/book/bibformatter.js
 :author: Brigitte Bigi
 :contact: contact@sppas.org
 :summary: A class to display a bibliographic reference according to its type.

 -------------------------------------------------------------------------

 This file is part of Whakerexa: https://github.com/brigitte-bigi/Whakerexa

 Copyright (C) 2023-2026 Brigitte Bigi, CNRS
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
 * Display a bibliographic reference according to its type.
 *
 * A journal article and a talk are not read the same way, and do not carry the
 * same fields. Which fields a type shows, and in which order, is written in
 * one place: changing a display is changing a template, and nothing else.
 *
 * Every field is written in an element of its own, and the stylesheet decides
 * what it looks like. Nothing here knows about italics.
 */
export class ReferenceFormatter {
    // CONSTANTS
    /**
     * Which fields each type shows, and in which order.
     *
     * A type that is not listed falls back on FALLBACK_TEMPLATE, so that a
     * reference is always displayed, whatever its type.
     */
    static TEMPLATES = new Map([
        ['article', ['author', 'title', 'journal', 'volume', 'number', 'pages', 'year']],
        ['inproceedings', ['author', 'title', 'booktitle', 'address', 'publisher', 'pages', 'year']],
        ['conference', ['author', 'title', 'booktitle', 'address', 'publisher', 'pages', 'year']],
        ['incollection', ['author', 'title', 'booktitle', 'editor', 'publisher', 'pages', 'year']],
        ['inbook', ['author', 'chapter', 'title', 'editor', 'publisher', 'pages', 'year']],
        ['book', ['author', 'title', 'editor', 'publisher', 'address', 'year']],
        ['techreport', ['author', 'title', 'institution', 'address', 'year']],
        ['phdthesis', ['author', 'title', 'type', 'school', 'address', 'year']],
        ['mastersthesis', ['author', 'title', 'type', 'school', 'address', 'year']],
        ['unpublished', ['author', 'title', 'note', 'year']],
        ['misc', ['author', 'title', 'howpublished', 'year']]
    ]);

    /**
     * What is shown of a type nobody planned for.
     */
    static FALLBACK_TEMPLATE = ['author', 'title', 'howpublished', 'year'];

    /**
     * Which fields a type cannot do without.
     *
     * One of these missing is worth showing, because the reference cannot be
     * found again without it. Any other missing field leaves no trace: an
     * article without a volume is not an article with a hole.
     */
    static REQUIRED = new Map([
        ['article', ['author', 'title', 'journal', 'year']],
        ['inproceedings', ['author', 'title', 'booktitle', 'year']],
        ['conference', ['author', 'title', 'booktitle', 'year']],
        ['incollection', ['author', 'title', 'booktitle', 'publisher', 'year']],
        ['inbook', ['author', 'title', 'publisher', 'year']],
        ['book', ['title', 'publisher', 'year']],
        ['techreport', ['author', 'title', 'institution', 'year']],
        ['phdthesis', ['author', 'title', 'school', 'year']],
        ['mastersthesis', ['author', 'title', 'school', 'year']],
        ['unpublished', ['author', 'title']],
        ['misc', []]
    ]);

    /**
     * What is required of a type nobody planned for: a title, and nothing
     * more. Guessing what an unknown type needs would only be guessing.
     */
    static FALLBACK_REQUIRED = ['title'];

    /**
     * What stands between two fields, and what closes a reference.
     */
    static SEPARATOR = ', ';
    static TERMINATOR = '.';


    // PUBLIC METHODS
    /**
     * Display a reference.
     *
     * Every author is written, whatever their number: a bibliography that
     * hides names behind "et al." hides people who did the work.
     *
     * @param reference {Reference} The reference to display.
     * @returns {DocumentFragment} What to put in a cell, never empty.
     */
    format(reference) {
        const fragment = document.createDocumentFragment();
        const template = this.#templateFor(reference.type);
        const required = this.#requiredFor(reference.type);
        let written = 0;

        template.forEach(name => {
            const element = this.#formatField(reference, name, required.includes(name));

            if (element === null) {
                return;
            }

            if (written > 0) {
                fragment.appendChild(document.createTextNode(ReferenceFormatter.SEPARATOR));
            }
            fragment.appendChild(element);
            written++;
        });

        if (written === 0) {
            fragment.appendChild(this.#formatMissing('title'));
        }
        fragment.appendChild(document.createTextNode(ReferenceFormatter.TERMINATOR));

        return fragment;
    }


    // PRIVATE METHODS
    /**
     * Display one field of a reference.
     *
     * @param reference {Reference} The reference being displayed.
     * @param name {string} The name of the field.
     * @param isRequired {boolean} Whether the type cannot do without it.
     * @returns {HTMLElement} The element to add, or null when there is nothing to say.
     */
    #formatField(reference, name, isRequired) {
        let value = reference.field(name);

        if (name === 'author') {
            value = reference.authors.map(author => author.text()).join(ReferenceFormatter.SEPARATOR);
        }

        if (value.length > 0) {
            const element = document.createElement('span');
            element.className = 'bib-' + name;
            element.textContent = value;

            return element;
        }

        if (isRequired === true) {
            return this.#formatMissing(name);
        }

        return null;
    }

    /**
     * Display a field that is missing.
     *
     * What is missing is written in full rather than left out, so that it is
     * seen on screen, read by a screen reader, and noticed by whoever keeps
     * the BibTeX data.
     *
     * @param name {string} The name of the missing field.
     * @returns {HTMLElement} The element to add.
     */
    #formatMissing(name) {
        const element = document.createElement('span');
        element.className = 'bib-missing';
        element.textContent = '[' + name + ']';
        element.setAttribute('title', 'This reference has no ' + name + '.');

        return element;
    }

    /**
     * Get the fields a type shows, and in which order.
     *
     * The case of the type is ignored: BibTeX is written by hand, and
     * "@Article" and "@article" are the same type seen twice.
     *
     * @param type {string} The entry type, as written.
     * @returns {string[]} The fields to show, never empty.
     */
    #templateFor(type) {
        const wanted = type.toLowerCase();

        if (ReferenceFormatter.TEMPLATES.has(wanted) === false) {
            return ReferenceFormatter.FALLBACK_TEMPLATE;
        }

        return ReferenceFormatter.TEMPLATES.get(wanted);
    }

    /**
     * Get the fields a type cannot do without.
     *
     * @param type {string} The entry type, as written.
     * @returns {string[]} The fields to show as missing when they are absent.
     */
    #requiredFor(type) {
        const wanted = type.toLowerCase();

        if (ReferenceFormatter.REQUIRED.has(wanted) === false) {
            return ReferenceFormatter.FALLBACK_REQUIRED;
        }

        return ReferenceFormatter.REQUIRED.get(wanted);
    }
}
