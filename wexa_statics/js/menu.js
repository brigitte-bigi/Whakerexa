/**
 :filename: wexa_statics.js.menu.js
 :author: Brigitte Bigi
 :contact: contact@sppas.org
 :summary: A class to manage menus/submenus in web apps.

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

'use strict';

class MenuManager {
    // Protected members
    #asideElement;
    #toggleButton;
    #menuLinks;

    // Bound focus-trap handler so it can be added/removed
    _focusTrapHandler;

    // ----------------------------------------------------------------------

    /**
     * Creates a MenuManager instance.
     *
     * @param {string} asideId - ID of the aside element containing the submenu.
     * @param {string} toggleButtonId - ID of the button that toggles the submenu.
     *
     */
    constructor(asideId = 'appmenu', toggleButtonId = 'submenu-toggle') {
        this.#asideElement = document.getElementById(asideId);
        this.#toggleButton = document.getElementById(toggleButtonId);
        // Include <a> and <button> elements as submenu items
        this.#menuLinks = this.#asideElement
            ? this.#menuLinks = this.#asideElement.querySelectorAll('a, button')
            : [];
        // Prepare a bound handler for focus trapping
        this._focusTrapHandler = this.#trapFocus.bind(this);

        this.#init();
    }

    // ----------------------------------------------------------------------

    /**
     * Initializes pin/unpin behavior for a side menu.
     *
     * This handles the click on the "pin menu" button to expand/collapse
     * the side navigation bar, updating ARIA attributes accordingly.
     *
     * @param {string} navSelector - CSS selector of the side nav element.
     * @param {string} pinButtonId - ID of the pin/unpin button.
     * @returns {void}
     */
    initSideMenu(navSelector = 'nav#nav-content.side.collapsible', pinButtonId = 'pin-menu') {
        const nav = document.querySelector(navSelector);
        const pinBtn = document.getElementById(pinButtonId);

        if (!nav) {
            console.warn(`MenuManager: Side menu not found with selector '${navSelector}'.`);
            return;
        }
        if (!pinBtn) {
            console.warn(`MenuManager: Pin button not found with id '${pinButtonId}'.`);
            return;
        }

        pinBtn.addEventListener('click', () => {
            const isPinned = nav.classList.toggle('expanded');
            nav.setAttribute('aria-pinned', isPinned ? 'true' : 'false');
            pinBtn.setAttribute('aria-pressed', String(isPinned));
            pinBtn.setAttribute('aria-label', isPinned ? 'Unpin menu' : 'Pin menu');
        });
    }

    // ----------------------------------------------------------------------

    /**
     * Initializes mobile menu toggle behavior.
     *
     * This method links the hidden checkbox, the navigation container,
     * and the visible menu button. It ensures that the menu state is
     * consistent and accessible: the checkbox holds the state, the nav
     * applies visual/ARIA changes, and the button is fully focusable
     * and activable via keyboard.
     *
     * @param {string} checkboxId - ID of the checkbox that controls the menu.
     * @param {string} navId - ID of the navigation container to expand/collapse.
     * @param {string} menuButtonId - ID of the visible menu button.
     * @returns {void}
     */
    initMobileToggle(checkboxId = 'mobile', navId = 'nav-content', menuButtonId = 'menu-button') {
        const checkbox = document.getElementById(checkboxId);
        const nav = document.getElementById(navId);
        const menuBtn = document.getElementById(menuButtonId);

        if (!checkbox || !nav) {
            console.warn('MenuManager: Cannot initialize mobile toggle: elements missing.');
            return;
        }

        /**
         * Update the state of the nav and button based on the checkbox.
         * - Toggle the 'expanded' class on nav.
         * - Sync aria-expanded on nav and menu button.
         */
        const updateMenuState = () => {
            const expanded = checkbox.checked;
            nav.classList.toggle('expanded', expanded);
            nav.setAttribute('aria-expanded', String(expanded));
            if (menuBtn) {
                menuBtn.setAttribute('aria-expanded', String(expanded));
            }
        };

        // React to direct checkbox changes
        checkbox.addEventListener('change', updateMenuState);
        updateMenuState();

        // React to clicks on the visible button (toggle the checkbox state)
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                checkbox.checked = !checkbox.checked;
                updateMenuState();
            });
        }
    }

    // ----------------------------------------------------------------------

    /**
     * Initializes event listeners and default states.
     *
     * @private
     *
     */
    #init() {
        if (!this.#asideElement || !this.#toggleButton) {
            console.warn('MenuManager: Required elements not found.');
            return;
        }

        // Disable focus on submenu items by default
        this.#setLinksTabIndex(-1);

        // Open submenu on toggle button click
        this.#toggleButton.addEventListener('click', (e) => {
            // Prevent default focus jump and stop propagation
            e.preventDefault();
            e.stopPropagation();
            this.openSubmenu();
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSubmenu();
            }
        });

        // Close when clicking outside submenu
        document.body.addEventListener('click', (e) => this.handleBodyClick(e));

        // Initial positioning and alignment
        this.adjustSubmenuPosition();
        this.adjustSubmenuAlignment();

        // Close all appmenus when the mouse re-enters the side menu
        const sideMenu = document.querySelector('nav#nav-content.side');
        if (sideMenu) {
            sideMenu.addEventListener('mouseenter', () => {
                document.querySelectorAll('aside.appmenu.open').forEach(submenu => {
                    submenu.classList.remove('open');
                    submenu.setAttribute('aria-hidden', 'true');
                });
            });
        }
    }

    // ----------------------------------------------------------------------

    /**
     * Initializes the MenuManager when the DOM content is fully loaded.
     *
     * It listens for the 'DOMContentLoaded' event and calls the method
     * to attach specific event listeners related to the MenuManager.
     *
     * @returns {void}
     *
     */
    handleMenuManagerOnLoad() {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('MenuManager loaded /// attached listener');
            this.attachSubmenuListeners();
        });
    }

    // ----------------------------------------------------------------------

    /**
     * Attaches event listeners to the body for managing clicks related
     * to the MenuManager's functionality.
     *
     * This method listens for click events on the body element and
     * delegates them to the handleBodyClick method to handle specific
     * click actions.
     *
     * @returns {void}
     *
     */
    attachSubmenuListeners() {
        document.querySelector('body').addEventListener('click', (event) => {
            this.handleBodyClick(event);  // Close the menu if clicked outside
        });
    }

    // ----------------------------------------------------------------------

    /**
     * Handles click events on the body element.
     * Closes the aside if the click is outside specified elements.
     *
     * @param {Event} event - The event object triggered by a click.
     *
     */
    handleBodyClick(event) {
        const target = event.target;

        // Close the submenu if the click is outside the aside or toggle button
        if (!this.#asideElement.contains(target) && target !== this.#toggleButton) {
            console.debug("Clicked on " + target);
            if (!['img', 'button', 'a', 'span', 'checkbox', 'input'].includes(target.localName)) {
                this.closeSubmenu(); // Close submenu when clicking outside
            } else {
                console.debug("  ==> this target do not allow to close the aside.")
            }
        }
    }

    // ----------------------------------------------------------------------

    /**
     * Reads CSS variable '--appmenu-position' and applies it.
     *
     * @returns {void}
     *
     */
    adjustSubmenuPosition() {
        const position = getComputedStyle(this.#asideElement)
            .getPropertyValue('--appmenu-position')
            .trim();

        if (position === '') {
            console.warn("No valid position found, defaulting to 'left'");
            this.#asideElement.style.left = '0';
        }

        // Set the data-submenu-position dynamically
        this.#asideElement.setAttribute('data-submenu-position', position);
        console.debug("Adjust submenu position: ", position);

        // Force reflow to ensure the styles are updated based on the new data-submenu-position
        this.#asideElement.offsetHeight;
    }

    // ----------------------------------------------------------------------

    /**
     * Reads CSS variable '--appmenu-align' and applies horizontal/vertical alignment.
     *
     * @returns {void}
     *
     */
    adjustSubmenuAlignment() {
        const align = getComputedStyle(this.#asideElement)
            .getPropertyValue('--appmenu-align')
            .trim();
        const [horizontal = 'center', vertical = 'center'] = align.split(' ');

        // Set the data-submenu-align dynamically
        this.#asideElement.setAttribute('data-submenu-align-horizontal', horizontal);
        this.#asideElement.setAttribute('data-submenu-align-vertical', vertical);
        console.debug("Additional alignment horizontal: ", horizontal);
        console.debug("Additional alignment vertical: ", vertical);

        // Force reflow to ensure the styles are updated based on the new data-submenu-position
        this.#asideElement.offsetHeight;
    }

    // ----------------------------------------------------------------------

    /**
     * Toggles the submenu open/closed, manages focus and traps it inside.
     *
     * This method is responsible for opening and closing the submenu when triggered,
     * and also ensures the proper management of focus within the submenu.
     * It prevents the user from tabbing out of the submenu and ensures smooth focus management.
     *
     * The submenu is opened when it was previously closed, and closed when it was previously opened.
     * When opening the submenu, it forces a reflow, ensures any other submenu is closed,
     * updates the tabindex of the menu items, enables focus trapping, and places focus on the first item.
     * When closing, it disables the focus trap and returns focus to the toggle button.
     *
     * This method listens for the `transitionend` event to ensure the submenu's transition is completed
     * before applying focus to the first menu item. This is important for smooth focus behavior,
     * especially when CSS transitions are used for the submenu's positioning or visibility.
     *
     * @returns {void} No return value.
     */
    openSubmenu() {
        const opened = this.#asideElement.classList.toggle('open');
        // Force reflow now menu is open
        void this.#asideElement.offsetHeight;

        // Close any other opened submenu
        if (opened) {
            document.querySelectorAll('.appmenu').forEach(submenu => {
                if (submenu !== this.#asideElement) {
                    submenu.classList.remove('open');
                    submenu.querySelectorAll('[role="menuitem"]').forEach(item => item.tabIndex = -1);
                }
            });
        }

        // Update menu items list and tabindex
        this.#menuLinks = this.#asideElement.querySelectorAll('a, button');
        this.#setLinksTabIndex(opened ? 0 : -1);

        if (opened) {
            // Enable focus trap immediately
            document.addEventListener('keydown', this._focusTrapHandler, true);
            // Wait for the menu transition to complete, then focus
            const onTransitionEnd = (ev) => {
                if (ev.propertyName === 'left') {
                    this.#menuLinks[0]?.focus();
                    this.#asideElement.removeEventListener('transitionend', onTransitionEnd);
                }
            };
            this.#asideElement.addEventListener('transitionend', onTransitionEnd);
        } else {
            // Remove trap and return focus
            document.removeEventListener('keydown', this._focusTrapHandler, true);
            this.#toggleButton.focus();
        }

        // Re-apply position/alignment if changed
        this.adjustSubmenuPosition();
        this.adjustSubmenuAlignment();
    }

    // ----------------------------------------------------------------------

    /**
     * Closes the submenu and cleans up focus trap listener.
     *
     */
    closeSubmenu() {
        if (this.#asideElement.classList.contains('open')) {
            this.#asideElement.classList.remove('open');
            this.#setLinksTabIndex(-1);
            this.#asideElement.removeEventListener('keydown', this._focusTrapHandler);
            this.#toggleButton.focus();
        }
    }

    // ----------------------------------------------------------------------

    /**
     * Traps focus within the submenu when Tab is pressed.
     *
     * @param {KeyboardEvent} e - The keydown event.
     * @private
     *
     */
    #trapFocus(e) {
        if (e.key !== 'Tab') return;
        const focusable = Array.from(this.#menuLinks);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {  // Shift + Tab
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {  // Tab
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    // ----------------------------------------------------------------------

    /**
     * Sets the tabindex attribute for each submenu link.
     *
     * @param {number} value - Tabindex value (-1 to disable, 0 to enable).
     * @private
     *
     */
    #setLinksTabIndex(value) {
        // Loop through each link and set its tabindex
        for (const link of this.#menuLinks) {
            link.tabIndex = value;
        }
    }
}

