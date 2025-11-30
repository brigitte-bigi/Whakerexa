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
"""

import os
import re
from datetime import datetime

# Inputs
JS_FOLDER = os.path.join("..", "wexa_statics", "js")
JS_FILES = [
    'logger.js',
    os.path.join('transport', 'request.js'),
    os.path.join('transport', 'base_manager.js'),

    os.path.join('slides', 'visibility.js'),
    os.path.join('slides', 'visibility_manager.js'),
    os.path.join('slides', 'focus.js'),
    os.path.join('slides', 'fullscreen.js'),
    os.path.join('slides', 'keyboard.js'),
    os.path.join('slides', 'overview.js'),
    os.path.join('slides', 'presentation.js'),
    os.path.join('slides', 'slides_view.js'),
    os.path.join('slides', 'slides_manager.js'),
    os.path.join('slides', 'touch.js'),
    os.path.join('slides', 'controls.js'),
    os.path.join('slides', 'modeview.js'),
    os.path.join('slides', 'slides_app.js'),
    os.path.join('slides', 'slides.js'),

    'dom-loader.js',
    'accessibility.js',
    'menu.js',
    'dialog.js',
    'progressbar.js',
    'book.js',
    'sortatable.js',
    'toggleselect.js',
    'links.js'
]

# Output
JS_BUNDLE = os.path.join(JS_FOLDER, "wexa.bundle.js")

# ---------------------------------------------------------------------------


def remove_jsdoc(text):
    """Remove all /** ... */ JSDoc blocks from the input text."""
    lines = text.splitlines(keepends=True)
    out = []
    skip = False

    for line in lines:
        stripped = line.lstrip()

        # Start of JSDoc block
        if stripped.startswith("/**"):
            skip = True
            continue

        # End of JSDoc block
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
    return "\n".join(line for line in text.splitlines() if line.strip() != "")

# ---------------------------------------------------------------------------


def remove_exports(text):
    """Remove ES6 'export' keywords from the code."""
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

def remove_export_blocks(text):
    """Remove ES6 export blocks: export { A, B, C };"""
    lines = text.splitlines(keepends=True)
    output = []
    in_block = False

    for line in lines:
        stripped = line.strip()

        if stripped.startswith('export {'):
            in_block = True
            continue

        if in_block is True:
            if stripped == '};':
                in_block = False
            continue

        output.append(line)

    return ''.join(output)

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

def extract_class_names(js_code):
    """Extract all top-level class names in the given JS code.

    Matches: 'class Name', 'class Name extends X'.
    :return: (list) a list of class names (strings).

    """
    pattern = r'^\s*class\s+([A-Za-z0-9_]+)'
    return re.findall(pattern, js_code, flags=re.MULTILINE)

# ---------------------------------------------------------------------------


def generate_wexa_exports(class_names):
    """Given a list of class names ['Slides', 'SlidesManager', ...],

    :return: (str) a JS string that assigns each class to window.Wexa.

    """
    if not class_names:
        return ""

    out = []
    out.append("\n// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----\n")
    out.append("if (typeof window.Wexa !== 'object') { window.Wexa = {}; }\n")

    for name in class_names:
        out.append(f"window.Wexa.{name} = {name};\n")

    out.append("// ---- END AUTO-GENERATED EXPORTS ----\n\n")
    return "".join(out)

# ---------------------------------------------------------------------------
# ---------------------------------------------------------------------------


if __name__ == '__main__':
    buffer = list()

    for filename in JS_FILES:

        # Full JS file path
        filepath = os.path.join(JS_FOLDER, filename)
        if os.path.exists(filepath) is False:
            raise FileNotFoundError(f'Missing JS module: {filepath}')

        # Header separator for readability.
        buffer.append(f'\n// ---------------- {filename} ---------------\n')

        # JS file content
        with open(filepath, "r", encoding="utf-8") as fp:
            content = fp.read()
            content = remove_jsdoc(content)
            # content = remove_block_comments(content)
            content = remove_empty_lines(content)
            content = remove_exports(content)
            content = remove_export_blocks(content)
            content = remove_imports(content)
        buffer.append(content)

        # --- Extract class names in this module
        class_names = extract_class_names(content)

        # --- Generate export lines for these classes
        if class_names:
            export_block = generate_wexa_exports(class_names)
            buffer.append(export_block)

    with open(JS_BUNDLE, "w", encoding="utf-8") as fp:
        fp.write(f"// Bundle automatically generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        fp.write("".join(buffer))