#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
:filename: build_icons.py
:author: Brigitte Bigi
:contact: contact@sppas.org
:summary: Gather the drawings of a set of icons into a document.

A document read where nothing serves it cannot go and get a file: a browser
refuses to read one. What such a document will need has therefore to be
gathered into it beforehand, which is what this script writes.

It reads the folders it is given and writes one JavaScript file. That file
leaves what it carries on the window, in no particular order, and the loader
pours it into the reader before the first demand is answered: a page adds it
with one tag, wherever it wants.

    python3 scripts/build_icons.py icons/child/ icons/adult/

Only the drawings are gathered. An image is never read: its address is what
answers, and a document read from a disk finds it beside itself.

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
import sys

# Output
GATHERED_FILE = "wexa_icons.js"

# What is gathered: a drawing is written into the page, an image is not.
DRAWING = ".svg"

# ---------------------------------------------------------------------------


def name_of(file_name):
    """Give the name a file answers to.

    :param file_name: (str) A file, with its extension.
    :return: (str) What it bears before its last dot.

    """
    return os.path.splitext(file_name)[0]

# ---------------------------------------------------------------------------


def drawings_of(folder):
    """Give the drawings a folder carries, in order.

    :param folder: (str)
    :return: (list of tuple) The name it answers to, and its markup.

    """
    gathered = list()

    for file_name in sorted(os.listdir(folder)):
        if file_name.endswith(DRAWING) is False:
            continue

        path = os.path.join(folder, file_name)
        with open(path, "r", encoding="utf-8") as source:
            gathered.append((name_of(file_name), source.read()))

    return gathered

# ---------------------------------------------------------------------------


def written_for(folders):
    """Give the content of the file to write.

    The name of a set is the name of its folder: it is what a page declares on
    the loader, and the two have to say the same thing.

    :param folders: (list of str)
    :return: (str)

    """
    lines = [
        "// Written by scripts/build_icons.py. What a document read from a",
        "// disk will need, gathered into it: a browser refuses to read a file",
        "// there, so nothing is asked for.",
        "window.WEXA_GATHERED_ICONS = [",
    ]

    total = 0
    for folder in folders:
        set_name = os.path.basename(os.path.normpath(folder))
        for name, markup in drawings_of(folder):
            lines.append("    [%s, %s, %s]," % (
                json.dumps(set_name), json.dumps(name), json.dumps(markup)))
            total += 1

    lines.append("];")
    return "\n".join(lines) + "\n", total

# ---------------------------------------------------------------------------


def main(folders):
    """Gather the drawings of the given folders.

    :param folders: (list of str)
    :return: (int) What the shell is told.

    """
    if len(folders) == 0:
        print("Usage: python3 scripts/build_icons.py <folder> [<folder>...]")
        return 1

    for folder in folders:
        if os.path.isdir(folder) is False:
            print("Folder not found: %s" % folder)
            return 1

    content, total = written_for(folders)
    if total == 0:
        print("No drawing found in %s." % ", ".join(folders))
        return 1

    with open(GATHERED_FILE, "w", encoding="utf-8") as destination:
        destination.write(content)

    print("%d drawings of %d set(s) gathered into %s"
          % (total, len(folders), GATHERED_FILE))
    print("Add it to the page, before the loader:")
    print('    <script src="%s"></script>' % GATHERED_FILE)
    return 0

# ---------------------------------------------------------------------------


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
