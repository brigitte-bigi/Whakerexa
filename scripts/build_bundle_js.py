#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
:filename: build.js_bundle.py
:author: Brigitte Bigi
:contact: contact@sppas.org
:summary: Generate a local JavaScript bundle for Whakerexa.

This script concatenates ES6 modules in an explicit order to produce a
single file compatible with local execution (file:///). It does not try to
resolve imports or exports and does not modify JavaScript code. The order
of files is intentionally fixed to reflect module dependencies.

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
"""

import json
import os
import re
from datetime import datetime

# Inputs
JS_FOLDER = os.path.join("wexa_statics", "js")
JS_FILES = [
    'logger.js',
    os.path.join('transport', 'request.js'),
    os.path.join('transport', 'base_manager.js'),

    os.path.join('extras', 'slides', 'slides_data.js'),
    os.path.join('extras', 'slides', 'navigation_logic.js'),
    os.path.join('extras', 'slides', 'viewmode_logic.js'),
    os.path.join('extras', 'slides', 'visibility.js'),
    os.path.join('extras', 'slides', 'visibility_manager.js'),
    os.path.join('extras', 'slides', 'focus.js'),
    os.path.join('extras', 'slides', 'fullscreen.js'),
    os.path.join('extras', 'slides', 'presentation_view.js'),
    os.path.join('extras', 'slides', 'overview_view.js'),
    os.path.join('extras', 'slides', 'keyboard_controller.js'),
    os.path.join('extras', 'slides', 'touch_controller.js'),
    os.path.join('extras', 'slides', 'buttons_controller.js'),
    os.path.join('extras', 'slides', 'note_view.js'),
    os.path.join('extras', 'slides', 'help_dialog.js'),
    os.path.join('extras', 'slides', 'slide_reaching.js'),
    os.path.join('extras', 'slides', 'slides_assembler.js'),
    os.path.join('extras', 'slides', 'slides.js'),
    os.path.join('extras', 'slides', 'slide_errors.js'),
    os.path.join('extras', 'slides', 'slide_block.js'),
    os.path.join('extras', 'slides', 'slide_layout.js'),
    os.path.join('extras', 'slides', 'slide_block_reader.js'),
    os.path.join('extras', 'slides', 'slide_measure.js'),
    os.path.join('extras', 'slides', 'slide_paginator.js'),
    os.path.join('extras', 'slides', 'slide_composer.js'),
    os.path.join('extras', 'slides', 'slides_pagination.js'),

    'dom-loader.js',
    'svgicons.js',
    'accessibility.js',
    'menu.js',
    'dialog.js',
    'progressbar.js',
    'toggleselect.js',
    'links.js',
    os.path.join('extras', 'theme_manager.js'),
    os.path.join('extras', 'book.js'),
    os.path.join('extras', 'sortatable.js'),

    os.path.join('extras', 'book', 'biberrors.js'),
    os.path.join('extras', 'book', 'labels.js'),
    os.path.join('extras', 'book', 'bibauthor.js'),
    os.path.join('extras', 'book', 'biblink.js'),
    os.path.join('extras', 'book', 'bibreference.js'),
    os.path.join('extras', 'book', 'bibcitedref.js'),
    os.path.join('extras', 'book', 'bibparser.js'),
    os.path.join('extras', 'book', 'bibformatter.js'),
    os.path.join('extras', 'book', 'bibcitedkey.js'),
    os.path.join('extras', 'book', 'bibcitation.js'),
    os.path.join('extras', 'book', 'bibtable.js'),
    os.path.join('extras', 'book', 'bibcite.js'),
    os.path.join('extras', 'book', 'bibsource.js'),
    os.path.join('extras', 'book', 'bibdisclosure.js'),
    os.path.join('extras', 'book', 'bibcontrols.js'),
    os.path.join('extras', 'book', 'bibbook.js'),

    os.path.join('extras', 'keypiano', 'keypiano.js'),
    os.path.join('extras', 'slides', 'slides.init.js'),
]

# Main module
JS_MODULE = "wexa.js"
MODULE_NAME = "Wexa"

# Output
JS_BUNDLE = os.path.join(JS_FOLDER, "wexa.bundle.js")

# SVG icons folder (relative to JS_FOLDER's parent)
ICONS_FOLDER = os.path.join(os.path.dirname(JS_FOLDER), "icons", "mono-svg")

# ---------------------------------------------------------------------------


def remove_jsdoc(text):
    """Remove all /** ... */ JSDoc blocks from the input text."""
    lines = text.splitlines(keepends=True)
    out = []
    skip = False

    for line in lines:
        stripped = line.lstrip()

        # Start of a JSDoc block
        if stripped.startswith("/**"):
            # Single-line block: /** ... */ — skip only this line
            if "*/" in stripped[3:]:
                continue
            # Multi-line block: start skipping
            skip = True
            continue

        # End of a multi-line JSDoc block
        if skip is True:
            if "*/" in stripped:
                skip = False
            continue

        # Normal line
        out.append(line)

    return "".join(out)

# ---------------------------------------------------------------------------


def remove_block_comments(text):
    """Remove /* ... */ comment blocks, leaving // comments untouched."""
    out = []
    in_block = False
    i = 0
    length = len(text)

    while i < length:
        # detect start of block
        if not in_block and text.startswith("/*", i):
            in_block = True
            i += 2
            continue

        # detect end of block
        if in_block:
            if text.startswith("*/", i):
                in_block = False
                i += 2
                continue
            i += 1
            continue

        out.append(text[i])
        i += 1

    return "".join(out)

# ---------------------------------------------------------------------------


def remove_empty_lines(text):
    """Remove empty lines of a given text.

    :param text: (str)
    :return: (str)

    """
    return "\n".join(line for line in text.splitlines() if line.strip() != "")

# ---------------------------------------------------------------------------


def remove_exports(text):
    """Remove ES6 'export' keywords from the code.

    :param text: (str)
    :return: (str)

    """
    out = []
    for line in text.splitlines(keepends=True):
        stripped = line.lstrip()

        # export default
        if stripped.startswith("export default "):
            new_line = line.replace("export default ", "", 1)
            out.append(new_line)
            continue

        # export class / export function / export const...
        if stripped.startswith("export "):
            new_line = line.replace("export ", "", 1)
            out.append(new_line)
            continue

        # normal line
        out.append(line)
    return "".join(out)

# ---------------------------------------------------------------------------


def remove_export_blocks(text):
    """Remove ES6 export blocks.

    Removes:
    - single line: export { A, B, C };
    - multi line:  export {
                      A,
                      B
                   };
                 (semicolon optional)

    :param text: (str) The text to be analyzed
    :return: (str) The text without ES6 export blocks

    """
    out = list()
    in_export = False
    brace_level = 0

    for line in text.splitlines(keepends=True):
        if in_export is False:
            stripped = line.lstrip()
            if stripped.startswith("export"):
                after = stripped[len("export"):].lstrip()
                if after.startswith("{"):
                    in_export = True
                    brace_level = after.count("{") - after.count("}")
                    # If the whole block is on the same line and ends with ';'
                    if brace_level <= 0 and ";" in after:
                        in_export = False
                        brace_level = 0
                    continue
            out.append(line)
            continue

        # We are inside an export { ... } block: skip lines until it closes.
        brace_level += line.count("{") - line.count("}")
        if brace_level <= 0:
            # Optional semicolon may be on this line or next line; skip only this line here.
            in_export = False
            brace_level = 0
        # Always skip lines while in_export, including the closing line.
        continue

    return "".join(out)

# ---------------------------------------------------------------------------


def remove_imports(text):
    """Remove ES6 import statements."""
    out = []
    for line in text.splitlines(keepends=True):
        stripped = line.strip()
        # Remove lines that begin with 'import '
        if stripped.startswith("import "):
            continue
        out.append(line)
    return "".join(out)

# ---------------------------------------------------------------------------


def replace_import_meta_url(text):
    """Replace import.meta.url with null for classic-script bundle compatibility."""
    return text.replace("import.meta.url", "null")

# ---------------------------------------------------------------------------


def remove_toplevel_await(text):
    """Remove 'await' from top-level await statements (no indentation)."""
    out = []
    for line in text.splitlines(keepends=True):
        if line == line.lstrip() and line.startswith("await "):
            out.append(line.replace("await ", "", 1))
        else:
            out.append(line)
    return "".join(out)

# ---------------------------------------------------------------------------


def extract_class_names(js_code):
    """Extract all top-level class names in the given JS code.

    Matches: 'class Name', 'class Name extends X'.
    :return: (list) a list of class names (strings).

    """
    pattern = r'^\s*class\s+([A-Za-z0-9_]+)'
    return re.findall(pattern, js_code, flags=re.MULTILINE)

# ---------------------------------------------------------------------------


def generate_wexa_exports(class_names, module_name):
    """Given a list of class names ['Slides', 'SlidesManager', ...],

    :param class_names: (str)
    :param module_name: (str)
    :return: (str) a JS string that assigns each class to window.Wexa.

    """
    if not class_names:
        return ""

    out = []
    out.append("\n// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----\n")
    out.append(f"if (typeof window.{module_name} !== 'object') {{ window.{module_name} = {{}}; }}\n")

    for name in class_names:
        out.append(f"window.{module_name}.{name} = {name};\n")

    out.append("// ---- END AUTO-GENERATED EXPORTS ----\n\n")
    return "".join(out)

# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------


def generate_svg_preregistration(icons_folder):
    """Inline all SVG files as SVGIconsManager.register() calls for bundle mode."""
    out = ['\n// ---------------- SVG icons (pre-registered for file:// mode) ---------------\n']
    for svg_file in sorted(os.listdir(icons_folder)):
        if not svg_file.endswith('.svg'):
            continue
        name = svg_file[:-4]
        svg_path = os.path.join(icons_folder, svg_file)
        with open(svg_path, 'r', encoding='utf-8') as fp:
            svg_content = fp.read().replace('\\', '\\\\').replace('`', '\\`')
        out.append(f"SVGIconsManager.register({repr(name)}, {json.dumps(svg_content)});\n")
    return ''.join(out)


def process_js_file(filepath, filename):
    """Read, transform and return bundle content for one JS file."""
    with open(filepath, "r", encoding="utf-8") as fp:
        content = fp.read()
    content = remove_jsdoc(content)
    content = remove_empty_lines(content)
    content = remove_export_blocks(content)
    content = remove_exports(content)
    content = remove_imports(content)
    content = replace_import_meta_url(content)
    if filename.endswith('slides.init.js'):
        content = remove_toplevel_await(content)
    return content


if __name__ == '__main__':

    # Lines of the bundle, stored in a list
    buffer = list()

    # slides.init.js must run after wexa.js so window.Wexa is fully set up
    # when its entry point executes. Process it separately at the end.
    SLIDES_INIT = os.path.join('extras', 'slides', 'slides.init.js')

    # Load and store each JS module except slides.init.js
    # ----------------------------------------------------
    for filename in JS_FILES:
        if filename == SLIDES_INIT:
            continue

        filepath = os.path.join(JS_FOLDER, filename)
        if os.path.exists(filepath) is False:
            raise FileNotFoundError(f'Missing JS module: {filepath}')

        buffer.append(f'\n// ---------------- {filename} ---------------\n')
        content = process_js_file(filepath, filename)
        buffer.append(content)

        class_names = extract_class_names(content)
        if class_names:
            buffer.append(generate_wexa_exports(class_names, MODULE_NAME))

    # SVG icons pre-registration — must run after SVGIconsManager is defined
    # ----------------------------------------------------------------------
    if os.path.isdir(ICONS_FOLDER):
        buffer.append(generate_svg_preregistration(ICONS_FOLDER))

    # The JS main module (wexa.js) — sets up window.Wexa
    # ---------------------------------------------------
    main_module_path = os.path.join(JS_FOLDER, JS_MODULE)
    if os.path.exists(main_module_path) is True:
        buffer.append(f"\n// ---------------- {JS_MODULE} ---------------\n")
        content = process_js_file(main_module_path, JS_MODULE)
        buffer.append(content)

    # slides.init.js entry point — runs after window.Wexa is ready
    # -------------------------------------------------------------
    if SLIDES_INIT in JS_FILES:
        filepath = os.path.join(JS_FOLDER, SLIDES_INIT)
        if os.path.exists(filepath) is False:
            raise FileNotFoundError(f'Missing JS module: {filepath}')
        buffer.append(f'\n// ---------------- {SLIDES_INIT} ---------------\n')
        content = process_js_file(filepath, SLIDES_INIT)
        buffer.append(content)
        class_names = extract_class_names(content)
        if class_names:
            buffer.append(generate_wexa_exports(class_names, MODULE_NAME))

    # Output bundle
    # -------------
    with open(JS_BUNDLE, "w", encoding="utf-8") as fp:
        fp.write(f"// Bundle automatically generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        fp.write("".join(buffer))
