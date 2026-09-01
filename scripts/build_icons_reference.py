#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
:filename: build_icons_reference.py
:author: Brigitte Bigi
:contact: contact@sppas.org
:summary: Write what the reference set of icons carries.

A set says what it carries, and never goes and looks: that is what lets a name
fall back to another set with no request at all. The set of the framework says
it here, and this script writes the list from the folder itself, so that an
icon added to the folder is carried without a line being written by hand.

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
ICONS_FOLDER = os.path.join("wexa_statics", "icons", "mono-svg")

# Output
REFERENCE_FILE = os.path.join("wexa_statics", "js", "customize",
                              "icon_reference.js")

# ---------------------------------------------------------------------------


def files_of(folder):
    """Give the files of a folder, in order.

    :param folder: (str)
    :return: (list of str)

    """
    return sorted(name for name in os.listdir(folder)
                  if name.endswith(".svg"))

# ---------------------------------------------------------------------------


def main():
    """Write the list of what the reference set carries."""
    if os.path.isdir(ICONS_FOLDER) is False:
        print("Folder not found: %s. Run from the root of the repository."
              % ICONS_FOLDER)
        return 1

    names = files_of(ICONS_FOLDER)
    if len(names) == 0:
        print("No icon found in %s." % ICONS_FOLDER)
        return 1

    text = open(REFERENCE_FILE, "r", encoding="utf-8").read()
    start = text.index("export const REFERENCE_FILES = [")
    head = text[:start]

    body = "export const REFERENCE_FILES = [\n"
    for name in names:
        body += "    '%s',\n" % name
    body += "];\n"

    open(REFERENCE_FILE, "w", encoding="utf-8").write(head + body)
    print("%d icons written into %s" % (len(names), REFERENCE_FILE))
    return 0

# ---------------------------------------------------------------------------


if __name__ == "__main__":
    sys.exit(main())
