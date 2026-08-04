/**
 :filename: statics.js.slides.slide_composer.js
 :author: Brigitte Bigi
 :contact: contact@sppas.org
 :summary: Engender the slides a layout asks for, and lay the blocks down.

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
 * Engender the slides a layout asks for, and lay the blocks down.
 *
 * This is the only class that changes the document shown. It moves the blocks
 * that no longer belong to the first slide, and never copies them: what the
 * author wrote is laid out, not duplicated.
 *
 * A table that is split keeps its head on every slide, and a list that is split
 * stays a list: a row taken out of its table, or an item out of its list, would
 * lose what makes it readable.
 */
export class SlideComposer {
    // CONSTANTS
    /**
     * What a title of a slide is.
     */
    static TITLE = 'h1, h2, h3, h4, h5, h6';


    // PUBLIC METHODS
    /**
     * Hold the tables of a slide to the widths their columns are drawn with.
     *
     * A table draws its columns from what they hold: with fewer rows, they are
     * drawn otherwise, and a cell that wraps one line more is a cell whose
     * height was measured for nothing. This is done before anything is
     * measured, so that what is measured is what will be shown.
     *
     * @param slide {HTMLElement} A slide of the document.
     * @returns {void}
     */
    freezeTables(slide) {
        Array.from(slide.querySelectorAll('table')).forEach(table => {
            this.#freezeColumns(table, this.#columnWidths(table));
        });
    }

    /**
     * Lay a slide out on as many slides as the layout asks for.
     *
     * @param slide {HTMLElement} The slide written by the author.
     * @param layout {SlideLayout} What was decided for its blocks.
     * @returns {HTMLElement[]} The slides, the written one first.
     */
    compose(slide, layout) {
        const parts = layout.parts;
        const slides = [slide];

        for (let rank = 1; rank < parts.length; rank++) {
            const next = this.#buildSlide(slide);

            this.#announce(slide, next);
            this.#lay(next, parts[rank]);

            slides[slides.length - 1].after(next);
            slides.push(next);
        }

        return slides;
    }


    // PRIVATE METHODS
    /**
     * Build a slide that continues another one, empty of any content.
     *
     * @param source {HTMLElement} The slide it continues.
     * @returns {HTMLElement} A slide, with the same classes and no identifier.
     */
    #buildSlide(source) {
        const next = document.createElement(source.tagName);
        next.className = source.className;

        return next;
    }

    /**
     * Write the title of a slide on the one that continues it.
     *
     * The title is the one the author wrote, and nothing is added to it: the
     * reader sees the same heading, and reads on.
     *
     * @param source {HTMLElement} The slide the title is taken from.
     * @param next {HTMLElement} The slide that continues it.
     * @returns {void}
     */
    #announce(source, next) {
        const title = source.querySelector(SlideComposer.TITLE);

        if (title === null) {
            return;
        }

        next.appendChild(title.cloneNode(true));
    }

    /**
     * Lay the blocks of a part in the slide that receives them.
     *
     * The blocks are moved, never copied, and those that were written in the
     * same table or the same list are laid down together, inside a table or a
     * list of their own.
     *
     * @param next {HTMLElement} The slide that receives them.
     * @param blocks {SlideBlock[]} The blocks of that part, in order.
     * @returns {void}
     */
    #lay(next, blocks) {
        let group = [];
        let parent = null;

        blocks.forEach(block => {
            const holder = block.element.parentElement;

            if (holder !== parent && group.length > 0) {
                this.#layGroup(next, parent, group);
                group = [];
            }

            parent = holder;
            group.push(block.element);
        });

        if (group.length > 0) {
            this.#layGroup(next, parent, group);
        }
    }

    /**
     * Lay a group of elements written in the same holder.
     *
     * @param next {HTMLElement} The slide that receives them.
     * @param parent {HTMLElement} What they were written in.
     * @param elements {HTMLElement[]} The elements to move, in order.
     * @returns {void}
     */
    #layGroup(next, parent, elements) {
        if (parent === null) {
            elements.forEach(element => next.appendChild(element));
            return;
        }

        if (parent.tagName === 'TBODY') {
            next.appendChild(this.#rebuildTable(parent, elements));
            return;
        }

        if (parent.tagName === 'UL' || parent.tagName === 'OL') {
            next.appendChild(this.#rebuildList(parent, elements));
            return;
        }

        elements.forEach(element => next.appendChild(element));
    }

    /**
     * Build the table that receives some rows, with the head of theirs.
     *
     * @param body {HTMLElement} The body the rows were written in.
     * @param rows {HTMLElement[]} The rows to move, in order.
     * @returns {HTMLTableElement} A table holding the head and those rows.
     */
    #rebuildTable(body, rows) {
        const source = body.closest('table');
        const table = source.cloneNode(false);
        const group = source.querySelector('colgroup');
        const head = source.querySelector('thead');

        if (group !== null) {
            table.appendChild(group.cloneNode(true));
        }

        if (head !== null) {
            table.appendChild(head.cloneNode(true));
        }

        const next = document.createElement('tbody');
        rows.forEach(row => next.appendChild(row));
        table.appendChild(next);

        return table;
    }

    /**
     * Get the width of each column of a table, as it is drawn.
     *
     * @param table {HTMLTableElement} The table the rows are taken from.
     * @returns {number[]} One width per column. Empty when the table has no row.
     */
    #columnWidths(table) {
        const row = table.rows[0];

        if (row === undefined) {
            return [];
        }

        // A width is fractional, and a column held to a fraction less than it
        // was drawn with clips what it holds: the first letter of a heading
        // goes first. It is therefore rounded up, never down.
        return Array.from(row.cells).map(cell => Math.ceil(this.#cellWidth(cell)));
    }

    /**
     * Get the width a cell needs, and not only the one it was given.
     *
     * A cell holding a button that is as wide as its column, which is what a
     * sort button is, gives the column nothing to be sized on: the column is
     * drawn on the shortest text it holds, and the heading is clipped. What
     * the button asks for is therefore counted too.
     *
     * @param cell {HTMLElement} A cell of the first row of the table.
     * @returns {number} The width to hold the column to.
     */
    #cellWidth(cell) {
        const given = cell.getBoundingClientRect().width;
        const held = Array.from(cell.children);

        if (held.length === 0) {
            return given;
        }

        const style = window.getComputedStyle(cell);
        const around = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
            + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);

        let asked = 0;

        held.forEach(child => {
            asked = Math.max(asked, child.scrollWidth);
        });

        return Math.max(given, asked + around);
    }

    /**
     * Give a table the widths its columns had before its rows were shared.
     *
     * A table draws its columns from what they hold: with fewer rows, they are
     * drawn otherwise, and a cell that wraps one line more is a cell whose
     * height was measured for nothing. The widths are therefore the ones of
     * the table the rows were written in, and every part keeps them.
     *
     * @param table {HTMLTableElement} The table to hold to those widths.
     * @param widths {number[]} One width per column.
     * @returns {void}
     */
    #freezeColumns(table, widths) {
        if (widths.length === 0) {
            return;
        }

        const group = document.createElement('colgroup');

        widths.forEach(width => {
            const column = document.createElement('col');
            column.style.width = width + 'px';
            group.appendChild(column);
        });

        const written = table.querySelector('colgroup');

        if (written !== null) {
            written.remove();
        }

        table.insertBefore(group, table.firstChild);
        table.style.tableLayout = 'fixed';

        // The table is as wide as its columns, and nothing caps it: capped, it
        // would give every column a share of what is left, and the narrowest
        // one loses the most. A heading then reads without its first letter.
        let total = 0;
        widths.forEach(width => {
            total = total + width;
        });

        table.style.width = total + 'px';
        table.style.maxWidth = 'none';
    }

    /**
     * Build the list that receives some items.
     *
     * @param source {HTMLElement} The list the items were written in.
     * @param items {HTMLElement[]} The items to move, in order.
     * @returns {HTMLElement} A list of the same kind, holding those items.
     */
    #rebuildList(source, items) {
        const list = source.cloneNode(false);
        items.forEach(item => list.appendChild(item));

        return list;
    }

}
