/**
 *  :filename: wexa_statics.js.logger.js
 *  :author: Brigitte Bigi
 *  :contact: contact@sppas.org
 *  :summary: A unified logging utility for all Whakerexa modules.
 *
 *  -------------------------------------------------------------------------
 *
 *  This file is part of Whakerexa: https://whakerexa.sf.net/
 *
 *  Copyright (C) 2023-2025 Brigitte Bigi, CNRS
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

/**
 *
 * @class WexaLogger
 * @classdesc
 * Provides a unified and lightweight logging utility for all Whakerexa modules.
 * Each method prefixes messages with "[Wexa]" to ensure consistent output
 * across the framework. This class is static-only and should not be instantiated.
 *
 * Typical usage:
 * ```js
 * import { WexaLogger } from './logger.js';
 * WexaLogger.info('Initialization complete.');
 * WexaLogger.error('Unhandled exception.', err);
 * ```
 *
 * @example
 * // Example usage in another module
 * WexaLogger.info('MenuManager loaded successfully.');
 *
 * @exports WexaLogger
 *
 */
export class WexaLogger {
    static debug(msg) { console.info(`[WexaDebug] ${msg}`); }
    static info(msg) { console.info(`[WexaInfo] ${msg}`); }
    static warn(msg) { console.warn(`[WexaWarning] ${msg}`); }
    static error(msg, err) { console.error(`[WexaError] ${msg}`, err || ''); }
}

window.WexaLogger = WexaLogger;
