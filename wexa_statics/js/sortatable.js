/**
:filename: statics.js.sortable.js
:author: Brigitte Bigi
:contact: contact@sppas.org
:summary: Class to sort rows of a table.

Copyright (C) 2023-2024 Brigitte Bigi, CNRS
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

**/

/**
 * Class SortaTable
 *
 * This class provides functionality to make an HTML table's columns sortable.
 * It allows attaching event listeners to the headers of a table and sorting
 * the rows based on the values in a specific column, either in ascending or
 * descending order.
 *
 * Key Features:
 * - Attaches 'click' event listeners to headers with the 'sortatable' class.
 * - Sorts table rows based on the 'data-sort' attribute found in the headers.
 * - Supports sorting based on different data types, including dates.
 *
 * Public Methods:
 * - attachSortListeners(): Binds the sorting functionality to the headers of the table.
 * - sort(): Sorts the rows of the table based on the selected column and order.
 *
 * Fields:
 * - _tableElt: The table element selected by its ID.
 * - #className: A private field that stores the class name of sortable headers.
 *
 * Usage:
 * const sortable = new SortaTable('myTableId');
 * sortable.attachSortListeners();
 */
class SortaTable {

    // FIELDS
    _tableElt
    #className

    // CONSTRUCTOR
    /**
     * Instantiate the sortable class.
     *
     * @param tableId {string} The id of the table to sort columns
     *
     */
    constructor(tableId) {
        this._tableElt = document.getElementById(tableId);
        if (!this._tableElt) {
            console.error('No table element is matching id ' + tableId);
        }
        // The name of the CSS class used by the button in the <th> element
        this.#className = ".sortatable";
    }

    /**
     * Attaches event listeners to table headers with the class 'sortable'.
     * The headers are expected to have a 'data-sort' attribute which specifies the column to sort.
     *
     */
    attachSortListeners() {
        console.debug(" **** attach sort listeners for table " + this._tableElt);
        // Add event listeners to all headers with class 'sortatable'
        const sortButtons = this._tableElt.querySelectorAll(this.#className);
        console.debug("Found " + sortButtons.length + " sort buttons in headers");

        sortButtons.forEach(button => {
            console.debug("Found sort button: ", `[${button}]`);
            button.addEventListener('click', (event) => {

                // Retrieve the data-sort attribute from the clicked header
                const sortAttribute = button.getAttribute('data-sort');
                // Check if the current header is already sorted in ascending order
                const currentIsAsc = button.classList.contains('sort-asc');

                this._tableElt.querySelectorAll(this.#className).forEach(h => {
                    h.classList.remove('sort-asc', 'sort-desc');
                });
                // Remove sort classes from all headers to reset the state
                document.querySelectorAll(this.#className).forEach(h => {
                    h.classList.remove('sort-asc', 'sort-desc');
                });
                // Add the appropriate sort class based on the current sort state
                button.classList.add(currentIsAsc ? 'sort-desc' : 'sort-asc');
                // Call the sortTable function to sort the table rows
                this.#sortTable(sortAttribute, !currentIsAsc);

                event.stopPropagation();
            });
        });
    }

    /**
     * Sorts the table based on a specified column.
     *
     * @param {string} column - The name of the column to sort by.
     * @param {boolean} [isAsc=true] - Whether to sort in ascending order (true) or descending (false).
     */
    sort(column, isAsc = true) {
        // Sort the table based on the specified column
        this.#sortTable(column, isAsc);

        // Optionally, update the class on the header to reflect the current sort direction
        const headerButton = this._tableElt.querySelector(`button[data-sort="${column}"]`);
        if (headerButton) {
            this._tableElt.querySelectorAll(this.#className).forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
            });
            headerButton.classList.add(isAsc ? 'sort-asc' : 'sort-desc');
        }
    }

    // ----------------------------------------------------------------------
    // PRIVATE
    // ----------------------------------------------------------------------

    /**
     * Sorts the table rows based on the selected column.
     *
     * @param {string} sortAttribute - The attribute of the column to sort by (e.g., column name).
     * @param {boolean} isAsc - Whether to sort in ascending order (true) or descending (false).
     *
     */
    #sortTable(sortAttribute, isAsc) {
        // Get the index of the column to sort by
        const columnIndex = this._tableElt.querySelector(`button[data-sort="${sortAttribute}"]`).closest('th').cellIndex;

        // Get the tbody element from the table
        const tableBody = this._tableElt.querySelector('tbody');
        // Convert the HTMLCollection of rows into an array for sorting
        const rows = Array.from(tableBody.getElementsByTagName('tr'));
        // Check if the attribute to sort by is 'date'
        const isDate = sortAttribute === 'date';

        // Sort the rows array using a custom comparator
        rows.sort((a, b) => {
            // Fetch the text content of the cells in the current column
            let aValue = a.cells[columnIndex].textContent.trim();
            let bValue = b.cells[columnIndex].textContent.trim();

            // If the attribute is 'date', convert string to Date object
            if (isDate) {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            // Determine the sort order based on the cell values and isAsc flag
            if (aValue < bValue) return isAsc ? -1 : 1;
            if (aValue > bValue) return isAsc ? 1 : -1;
            return 0;
        });

        // Re-append sorted rows back to the table body
        rows.forEach(row => tableBody.appendChild(row));
    }

}
