/**
 :filename: wexa_statics.js.wexa.js
 :author: Brigitte Bigi
 :contact: contact@sppas.org

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
/**
 * Whakerexa main module entry point.
 * Imports and exposes the core components of the framework under a single
 * global namespace: `window.Wexa`.
 *
 * The namespace allows web pages to access Whakerexa's core managers
 * (loader, logger, accessibility, and menu) without individual imports.
 *
 * @module Wexa
 * @property {OnLoadManager} OnLoadManager - Handles delayed and ordered initialization of components.
 * @property {WexaLogger} WexaLogger - Provides unified logging across all modules.
 * @property {AccessibilityManager} AccessibilityManager - Manages accessibility options (themes, contrast, etc.).
 * @property {MenuManager} MenuManager - Controls all navigation menus and submenus.
 *
 */
import { OnLoadManager } from './dom-loader.js';
import { WexaLogger } from './logger.js';
import { AccessibilityManager } from './accessibility.js';
import { MenuManager } from './menu.js';

// Global namespace exposing Whakerexa core managers
window.Wexa = { OnLoadManager, WexaLogger, AccessibilityManager, MenuManager };
