/**
 * :filename: statics.js.customize.icon_manager.js
 * :author: Brigitte Bigi
 * :contact: contact@sppas.org
 * :summary: Calls the others in order. The only one that catches an error.
 *
 *  -------------------------------------------------------------------------
 *
 *  This file is part of Whakerexa: https://github.com/brigitte-bigi/Whakerexa
 *
 *  Copyright (C) 2023-2026 Brigitte Bigi, CNRS
 *  Laboratoire Parole et Langage, Aix-en-Provence, France
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 *  This banner notice must not be removed.
 *
 *  -------------------------------------------------------------------------
 */

'use strict';

import { WexaLogger } from '../logger.js';
import { IconSets } from './icon_sets.js';
import { IconChoice } from './icon_choice.js';
import { IconReader } from './icon_reader.js';
import { IconPlacer } from './icon_placer.js';
import { IconWatcher } from './icon_watcher.js';
import { IconRegister } from './icon_register.js';
import { IconDemand } from './icon_demand.js';
import { IconError } from './icon_errors.js';

/**
 * Answers the demands of a document.
 *
 * It calls the others in order and holds nothing of its own: the sets say
 * which one answers a name, the choice says which is in force, the watcher
 * says when a demand is about to be seen, the reader goes and gets what
 * answers, and the placer puts it where it was asked for.
 *
 * It is the only class that writes a try. A name no set carries draws nothing,
 * keeps its room, is said in the console, and breaks no page: an error must
 * never do worse than the absence of the program.
 */
export class IconManager {

    /** @type {IconSets} */
    #sets;

    /** @type {IconChoice} */
    #choice;

    /** @type {IconReader} */
    #reader = new IconReader();

    /** @type {IconPlacer} */
    #placer = new IconPlacer();

    /** @type {IconWatcher} */
    #watcher = new IconWatcher();

    /** @type {IconRegister} */
    #register = new IconRegister();

    /**
     * @param {IconSets} sets - The sets that were declared.
     * @param {string} [named] - The set the page names, if any.
     */
    constructor(sets, named = '') {
        this.#sets = sets;
        this.#choice = new IconChoice(sets, named);
    }

    // -----------------------------------------------------------------------

    /** @returns {string} The name of the set the document is shown with. */
    inForce() {
        return this.#choice.inForce();
    }

    /** @returns {string[]} The names of the sets, the reference one last. */
    names() {
        return this.#sets.names();
    }

    // -----------------------------------------------------------------------

    /**
     * Watch the demands of the document, and answer them as they are seen.
     *
     * @param {HTMLElement} [root] - What holds the demands.
     * @returns {Promise<void>} Never raises.
     */
    async run(root = document) {
        try {
            const demands = [];
            for (const element of root.querySelectorAll(IconDemand.SELECTOR)) {
                const demand = IconDemand.of(element);
                if (demand !== null) {
                    demands.push(demand);
                }
            }

            this.#watcher.watch(demands, demand => this.#answer(demand));

        } catch (error) {
            this.#say(error);
        }
    }

    // -----------------------------------------------------------------------

    /**
     * Show the document with another set.
     *
     * What is held is answered again, and nothing else: what is not seen is
     * answered when it is seen, under the set in force then.
     *
     * @param {string} name - The name of the set to put in force.
     * @returns {Promise<void>} Never raises.
     */
    async show(name) {
        try {
            if (this.#choice.put(name) === false) {
                return;
            }

            for (const demand of this.#register.held()) {
                await this.#answer(demand);
            }

        } catch (error) {
            this.#say(error);
        }
    }

    // -----------------------------------------------------------------------
    // PRIVATE
    // -----------------------------------------------------------------------

    /**
     * Answer one demand.
     *
     * @private
     * @param {IconDemand} demand
     * @returns {Promise<void>}
     */
    async #answer(demand) {
        const set = this.#sets.setFor(demand.name, this.#choice.inForce());

        if (set === null) {
            this.#placer.clear(demand);
            this.#register.hold(demand);
            WexaLogger.warn('IconManager: no set carries the name "'
                + demand.name + '".');
            return;
        }

        try {
            const content = await this.#reader.read(set, demand.name);
            this.#placer.place(demand, content);
        } catch (error) {
            this.#placer.clear(demand);
            this.#say(error);
        }

        this.#register.hold(demand);
    }

    // -----------------------------------------------------------------------

    /**
     * Say what went wrong, and let the page hold.
     *
     * @private
     * @param {Error} error
     * @returns {void}
     */
    #say(error) {
        if (error instanceof IconError) {
            WexaLogger.error('IconManager: ' + error.message);
            return;
        }
        WexaLogger.error('IconManager: ', error);
    }
}
