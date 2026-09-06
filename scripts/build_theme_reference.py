#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
:filename: build_theme_reference.py
:author: Brigitte Bigi
:contact: contact@sppas.org
:summary: Write the list of the themes the framework carries.

A page says which themes it takes, and names those of the framework by their
name alone. That name has to be known without asking the server, on a document
opened from a disk as on one that is served: the list is written here, from
what the folder of the themes holds, exactly as the reference set of the icons
is written from what its folder holds.

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
import sys

# Inputs
THEMES_FOLDER = os.path.join("wexa_statics", "css", "themes")

# Output
REFERENCE_FILE = os.path.join("wexa_statics", "js", "customize",
                              "theme_reference.js")

# The one a page gets when it says nothing, and the first of the cycle.
DEFAULT_FILE = "wexa_theme.css"

# ---------------------------------------------------------------------------


def name_of(file_name):
    """Give the name a theme answers to.

    A theme is named by what its file bears after 'wexa_theme_', the default
    one keeping the whole of its own name.

    :param file_name: (str) A file, with its extension.
    :return: (str) The name a page writes.

    """
    stem = file_name[:-len(".css")]
    if stem.startswith("wexa_theme_") is True:
        return stem[len("wexa_theme_"):]
    return stem

# ---------------------------------------------------------------------------


def themes_of(folder):
    """Give the themes of a folder, the default one first.

    :param folder: (str)
    :return: (list) One (name, file) per theme.

    """
    files = sorted(name for name in os.listdir(folder)
                   if name.endswith(".css"))

    ordered = []
    if DEFAULT_FILE in files:
        ordered.append(DEFAULT_FILE)
    ordered.extend(name for name in files if name != DEFAULT_FILE)

    return [(name_of(name), name) for name in ordered]

# ---------------------------------------------------------------------------


def main():
    """Write the list of what the framework carries."""
    if os.path.isdir(THEMES_FOLDER) is False:
        print("Folder not found: %s. Run from the root of the repository."
              % THEMES_FOLDER)
        return 1

    themes = themes_of(THEMES_FOLDER)
    if len(themes) == 0:
        print("No theme found in %s." % THEMES_FOLDER)
        return 1

    text = open(REFERENCE_FILE, "r", encoding="utf-8").read()
    start = text.index("export const REFERENCE_THEMES = [")
    head = text[:start]

    lines = ["export const REFERENCE_THEMES = ["]
    for name, file_name in themes:
        lines.append("    ['%s', '%s']," % (name, file_name))
    lines.append("];")

    with open(REFERENCE_FILE, "w", encoding="utf-8") as output:
        output.write(head + "\n".join(lines) + "\n")

    print("%d themes written into %s" % (len(themes), REFERENCE_FILE))
    return 0

# ---------------------------------------------------------------------------


if __name__ == "__main__":
    sys.exit(main())
