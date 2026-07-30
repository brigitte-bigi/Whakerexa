/**
 :filename: wexa_statics/js/extras/book/controls.js
 :author: Brigitte Bigi
 :contact: contact@sppas.org
 :summary: A class to sort and to search a bibliography.

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

import { SortaTable } from '../sortatable.js';
import { BibliographyTable } from './bibtable.js';
import { Labels } from './labels.js';

/**
 * Sort and search a bibliography.
 *
 * Sorting is done by SortaTable, which the table was built for: its headers
 * carry the buttons it expects, and the cell of a reference carries the value
 * it is sorted on, the family name of its first author.
 *
 * Searching is new: SortaTable hides columns, not rows. A search keeps the
 * references a word appears in, and hides the others.
 *
 * Whatever changes is said, and not only shown: a reader who does not see the
 * table has no other way of knowing that it just became shorter.
 */
export class BibliographyControls {
    // CONSTANTS
    /**
     * What the program writes, in the languages it knows.
     */
    static LABELS = new Map([
        ['en', {
            search: 'Search in the bibliography',
            shownOne: 'reference shown', shownMany: 'references shown',
            sortedBy: 'sorted by', ascending: 'ascending', descending: 'descending',
            unsorted: 'back to the original order'
        }],
        ['fr', {
            search: 'Rechercher dans la bibliographie',
            shownOne: 'référence affichée', shownMany: 'références affichées',
            sortedBy: 'rangé par', ascending: 'ordre croissant', descending: 'ordre décroissant',
            unsorted: 'retour à l\'ordre de départ'
        }]
    ]);


    // FIELDS
    #table;
    #texts;
    #sorter;
    #field;
    #announcement;


    // CONSTRUCTOR
    /**
     * Instantiate the controls of a bibliography.
     *
     * The search field and what is said are written before the table, so that
     * a reader meets them before what they act upon.
     *
     * @param table {HTMLTableElement} The table of the bibliography.
     */
    constructor(table) {
        this.#table = table;
        this.#texts = new Labels(BibliographyControls.LABELS);

        const search = this.#buildSearch();
        this.#field = search.querySelector('input');
        this.#announcement = this.#buildAnnouncement();

        this.#table.before(search);
        this.#table.before(this.#announcement);

        this.#sorter = new SortaTable(this.#table.id);
        this.#sorter.attachSortListeners();
        this.#watchSortButtons();
    }


    // GETTERS
    /**
     * Get the field a word is searched from.
     *
     * @returns {HTMLElement}
     */
    get field() {
        return this.#field;
    }

    /**
     * Get what says aloud whatever changes.
     *
     * @returns {HTMLElement}
     */
    get announcement() {
        return this.#announcement;
    }


    // PUBLIC METHODS
    /**
     * Sort the bibliography on one of its columns.
     *
     * The numbers do not move: they were given by the order of the text, and
     * nothing here starts that again.
     *
     * @param column {string} The name of the column, as its button declares it.
     * @param isAscending {boolean} Whether the order goes up.
     * @returns {void}
     */
    sortBy(column, isAscending = true) {
        this.#sorter.sort(column, isAscending);
        this.#putOpenedRowsBack();
        BibliographyTable.stripe(this.#table);
        this.#sayHowItIsSorted();
    }

    /**
     * Keep the references a word appears in, and hide the others.
     *
     * The case and the accents of the word do not matter: someone looking for
     * "Andre" is looking for "André".
     *
     * @param word {string} The word to look for. An empty word shows everything.
     * @returns {void}
     */
    filter(word) {
        const wanted = BibliographyControls.#simplify(word);
        const rows = this.#table.querySelectorAll('tbody tr.bib-row');
        let shown = 0;

        rows.forEach(row => {
            const found = BibliographyControls.#simplify(this.#textOf(row)).includes(wanted);
            row.hidden = found === false;

            // A content that was left open goes away with its reference, and
            // comes back with it: nobody asked for it to be closed.
            this.#openedRowsOf(row).forEach(opened => {
                opened.hidden = found === false || this.#isOpen(opened) === false;
            });

            if (found === true) {
                shown++;
            }
        });

        BibliographyTable.stripe(this.#table);
        this.#sayHowManyAreShown(shown);
    }


    // PRIVATE METHODS
    /**
     * Get the rows that hold what one reference opens.
     *
     * @param row {HTMLElement} The row of a reference.
     * @returns {HTMLElement[]} Its contents, possibly none.
     */
    #openedRowsOf(row) {
        return Array.from(this.#table.querySelectorAll(`tr.bib-opened-row[data-opens="${row.id}"]`));
    }

    /**
     * Tell whether a content is open.
     *
     * The answer is read on the control that opens it, which is the only
     * place where it is written.
     *
     * @param opened {HTMLElement} The row holding a content.
     * @returns {boolean}
     */
    #isOpen(opened) {
        const control = this.#table.querySelector(`[aria-controls="${opened.id}"]`);

        if (control === null) {
            return false;
        }

        return control.getAttribute('aria-expanded') === 'true';
    }

    /**
     * Get everything a reference is searched through.
     *
     * The abstract counts: someone looking for a word looks for it in what
     * the reference says, not only in its title.
     *
     * @param row {HTMLElement} The row of a reference.
     * @returns {string} What is searched.
     */
    #textOf(row) {
        const texts = [row.textContent];

        this.#openedRowsOf(row).forEach(opened => texts.push(opened.textContent));

        return texts.join(' ');
    }

    /**
     * Put every content back behind the reference it belongs to.
     *
     * Sorting moves rows, and knows nothing about the ones that hold a content
     * across the whole table. They are put back afterwards, in the order they
     * were built in.
     *
     * @returns {void}
     */
    #putOpenedRowsBack() {
        const body = this.#table.querySelector('tbody');

        body.querySelectorAll('tr.bib-row').forEach(row => {
            let previous = row;

            this.#openedRowsOf(row).forEach(opened => {
                previous.after(opened);
                previous = opened;
            });
        });
    }

    /**
     * Build the label and the field a word is searched from.
     *
     * @returns {HTMLElement} The label, the field inside it.
     */
    #buildSearch() {
        const label = document.createElement('label');
        label.className = 'bib-search';

        const text = document.createElement('span');
        this.#texts.write(text, 'search');

        const field = document.createElement('input');
        field.type = 'search';
        field.className = 'bib-search-field';

        label.appendChild(text);
        label.appendChild(field);

        field.addEventListener('input', () => this.filter(field.value));

        return label;
    }

    /**
     * Build what says aloud whatever changes.
     *
     * @returns {HTMLElement} A region a screen reader reads when it changes.
     */
    #buildAnnouncement() {
        const region = document.createElement('p');
        region.className = 'bib-announcement';
        region.setAttribute('role', 'status');
        region.setAttribute('aria-live', 'polite');

        return region;
    }

    /**
     * Listen to the buttons of the headers, to say what they just did.
     *
     * SortaTable does the sorting itself; these listeners are added after its
     * own, so that the state of the buttons is already the new one.
     *
     * @returns {void}
     */
    #watchSortButtons() {
        this.#table.querySelectorAll('button.sortatable').forEach(button => {
            button.addEventListener('click', () => {
                this.#putOpenedRowsBack();
                BibliographyTable.stripe(this.#table);
                this.#sayHowItIsSorted();
            });
        });
    }

    /**
     * Say on which column and in which order the bibliography is sorted.
     *
     * @returns {void}
     */
    #sayHowItIsSorted() {
        const ascending = this.#table.querySelector('button.sortatable.sort-asc');
        const descending = this.#table.querySelector('button.sortatable.sort-desc');

        if (ascending !== null) {
            this.#announce(`${this.#texts.text('sortedBy')} ${ascending.textContent}, `
                + this.#texts.text('ascending'));
            return;
        }

        if (descending !== null) {
            this.#announce(`${this.#texts.text('sortedBy')} ${descending.textContent}, `
                + this.#texts.text('descending'));
            return;
        }

        this.#announce(this.#texts.text('unsorted'));
    }

    /**
     * Say how many references are left after a search.
     *
     * @param shown {number} How many references are still displayed.
     * @returns {void}
     */
    #sayHowManyAreShown(shown) {
        if (shown === 1) {
            this.#announce(`1 ${this.#texts.text('shownOne')}`);
            return;
        }

        this.#announce(`${shown} ${this.#texts.text('shownMany')}`);
    }

    /**
     * Say something aloud.
     *
     * @param text {string} What to say.
     * @returns {void}
     */
    #announce(text) {
        this.#announcement.textContent = text;
        this.#texts.declare(this.#announcement);
    }


    // PRIVATE STATIC METHODS
    /**
     * Write a text the way it is compared: lower case, and without accents.
     *
     * @param text {string} The text to simplify.
     * @returns {string} What is compared.
     */
    static #simplify(text) {
        return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    }
}
