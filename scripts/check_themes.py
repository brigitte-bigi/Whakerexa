#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
:filename: check_themes.py
:author: Brigitte Bigi
:contact: contact@sppas.org
:summary: Check that every theme of Whakerexa honours the theme contract.

A theme says what a document looks like. It is loaded after wexa.css, and
whatever it leaves undefined keeps the value wexa.css gives it: a theme that
defines a background and forgets the text written on it borrows a color from
another palette, and nobody sees it until a page is read in the mode nobody
opened.

The contract is written by group. A theme is free to leave a whole group to
wexa.css, whose palette holds on its own. But a theme that touches one
variable of a group answers for the group entire, in the two modes: giving a
ground without the text laid on it, or a button without the color it takes
under the pointer, is what leaves a page half dressed.

Exits with 1 when a group is left incomplete, so that it can be run before a
commit, as the bundle is rebuilt before a commit.

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

import os
import re
import sys

# Inputs
THEMES_FOLDER = os.path.join("wexa_statics", "css", "themes")

# The two modes a theme is read in.
LIGHT = "light"
DARK = "dark"

# The contract, group by group. A theme is free to leave a group to wexa.css.
# A theme that defines one variable of a group answers for all of them, in
# the two modes.
GROUPS = {
    "grounds": [
        "--body-bg-color",
        "--bg-color",
        "--bg-color-alt",
    ],
    "text": [
        "--fg-color",
        "--fg-color-alt",
    ],
    "header": [
        "--header-bg-color",
        "--header-fg-color",
    ],
    "nav": [
        "--nav-bg-color",
        "--nav-fg-color",
    ],
    "footer": [
        "--footer-bg-color",
        "--footer-fg-color",
    ],
    "buttons": [
        "--buttons-bg-color",
        "--buttons-bg-color-hover",
        "--buttons-fg-color",
    ],
    "accents": [
        "--a-color",
        "--li-color",
    ],
    "borders": [
        "--border-color",
        "--border-color-alt",
    ],
    "headings": [
        "--h1-color",
        "--h2-color",
        "--h3-color",
        "--h4-color",
        "--h5-color",
        "--h6-color",
    ],
    "blockquote": [
        "--blockquote-border-color",
        "--blockquote-footer-color",
    ],
    "table": [
        "--table-border-color",
        "--table-cell-bg-color",
        "--table-row-stripped-bg-color",
        "--table-head-bg-color",
        "--table-head-fg-color",
        "--table-caption-bg-color",
        "--table-caption-fg-color",
    ],
    "card": [
        "--card-bg-color",
        "--card-fg-color",
    ],
    "dialog": [
        "--dialog-bg-color",
        "--dialog-fg-color",
    ],
    "progress": [
        "--progress-bg-color",
        "--progress-fg-color",
    ],
    "mark": [
        "--mark-bg-color",
        "--mark-fg-color",
    ],
    "switch": [
        "--switch-bg-color",
        "--switch-slider-on-color",
        "--switch-slider-off-color",
    ],
    "custom pair": [
        "--custom-color1",
        "--custom-color2",
    ],
}

# ---------------------------------------------------------------------------


def remove_comments(text):
    """Remove the /* ... */ comments of a stylesheet.

    A comment may hold a brace, which would be read as a block.

    :param text: (str)
    :return: (str)

    """
    return re.sub(r"/\*.*?\*/", "", text, flags=re.DOTALL)

# ---------------------------------------------------------------------------


def modes_of(selectors):
    """Say the modes a stack of selectors applies to.

    A selector naming '.dark' applies to the dark mode. One naming
    ':not(.dark)' or '.light' applies to the light one. A selector naming
    neither applies to both, as ':root' does.

    :param selectors: (list of str) The blocks a declaration stands in.
    :return: (list of str) One mode, or the two of them.

    """
    for selector in selectors:
        if ":not(.dark)" in selector or ".light" in selector:
            return [LIGHT]
        if ".dark" in selector:
            return [DARK]

    return [LIGHT, DARK]

# ---------------------------------------------------------------------------


def variables_of(path):
    """Read the variables a theme defines, mode by mode.

    :param path: (str) The stylesheet to read.
    :return: (dict) One set of variable names per mode.

    """
    text = remove_comments(open(path, "r", encoding="utf-8").read())

    defined = {LIGHT: set(), DARK: set()}
    selectors = []
    current = ""

    for character in text:
        if character == "{":
            selectors.append(current.strip().replace("\n", " "))
            current = ""
            continue

        if character == "}":
            if len(selectors) > 0:
                selectors.pop()
            current = ""
            continue

        if character == ";":
            declaration = current.strip()
            if declaration.startswith("--") is True:
                name = declaration.split(":")[0].strip()
                for mode in modes_of(selectors):
                    defined[mode].add(name)
            current = ""
            continue

        current += character

    return defined

# ---------------------------------------------------------------------------


def incomplete_groups(defined):
    """Say which groups a theme touches without answering for them.

    A group nothing defines is left to wexa.css and is not reported. A group
    one variable defines is asked for entire, in the two modes.

    :param defined: (dict) What the theme defines, mode by mode.
    :return: (list) One (group, mode, missing names) per hole.

    """
    touched_everywhere = defined[LIGHT] | defined[DARK]
    holes = []

    for group in GROUPS:
        names = GROUPS[group]
        touched = [name for name in names if name in touched_everywhere]
        if len(touched) == 0:
            continue

        for mode in (LIGHT, DARK):
            missing = [name for name in names if name not in defined[mode]]
            if len(missing) > 0:
                holes.append((group, mode, missing))

    return holes

# ---------------------------------------------------------------------------


def report(name, holes):
    """Write what a theme leaves out.

    :param name: (str) The file of the theme.
    :param holes: (list) What incomplete_groups() gives back.
    :return: (bool) True when every group it touches is answered for.

    """
    print("")
    print(name)

    if len(holes) == 0:
        print("    every group it touches is defined in both modes")
        return True

    for group, mode, missing in holes:
        print("    %-12s %-5s missing %d: %s"
              % (group, mode, len(missing), ", ".join(missing)))

    return False

# ---------------------------------------------------------------------------


def main():
    """Check every theme, and say whether the contract is held."""
    if os.path.isdir(THEMES_FOLDER) is False:
        print("Folder not found: %s. Run from the root of the repository."
              % THEMES_FOLDER)
        return 1

    themes = sorted(f for f in os.listdir(THEMES_FOLDER) if f.endswith(".css"))
    if len(themes) == 0:
        print("No theme found in %s." % THEMES_FOLDER)
        return 1

    total = sum(len(GROUPS[group]) for group in GROUPS)
    print("Theme contract: %d groups, %d variables, each group entire in both modes."
          % (len(GROUPS), total))

    held = True
    for theme in themes:
        defined = variables_of(os.path.join(THEMES_FOLDER, theme))
        if report(theme, incomplete_groups(defined)) is False:
            held = False

    print("")
    if held is True:
        print("The contract is held by every theme.")
        return 0

    print("The contract is not held.")
    return 1

# ---------------------------------------------------------------------------


if __name__ == "__main__":
    sys.exit(main())
