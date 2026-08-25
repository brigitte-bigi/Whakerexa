#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
:filename: build_css_min.py
:author: Brigitte Bigi
:contact: contact@sppas.org
:summary: Generate a minified copy of the Whakerexa stylesheets.

This script reads every stylesheet of wexa_statics/css and writes it again,
without its comments and without the blanks it is laid out with, into
wexa_statics/css.min. The tree is mirrored, so that a page switches from one
to the other by changing a single segment of its paths, and so that what a
stylesheet imports or points at keeps working untouched.

What is removed is what a browser does not read: the comments, the
indentation, the line breaks, and the repeated spaces. What is kept is every
single space between two symbols, because a space is part of the language:
'calc(1.5 * var(--font-size))' is invalid without the ones around the star,
and 'a b' does not select what 'ab' selects. A stylesheet minified here is
therefore never smaller than it could be, and never says anything else.

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
import shutil

# Inputs and outputs
CSS_FOLDER = os.path.join("wexa_statics", "css")
CSS_MIN_FOLDER = os.path.join("wexa_statics", "css.min")

# A comment, from its opening to its closing, across as many lines as it takes.
COMMENT = re.compile(r"/\*.*?\*/", re.DOTALL)

# A run of blanks: spaces, tabulations, line breaks.
BLANKS = re.compile(r"\s+")

# A blank standing next to a symbol that never needs one to be read.
AROUND_SYMBOLS = re.compile(r"\s*([{};,>])\s*")

# The blank after the colon of a declaration. The colon of a selector, as in
# 'a:hover' or ':root', never carries one, so it is left where it is.
AFTER_COLON = re.compile(r":\s+")


def minify(content):
    """Give the stylesheet back without what a browser does not read.

    :param content: (str) The stylesheet, as it is written.
    :returns: (str) The same stylesheet, without comments nor layout.

    """
    content = COMMENT.sub("", content)
    content = BLANKS.sub(" ", content)
    content = AROUND_SYMBOLS.sub(r"\1", content)
    content = AFTER_COLON.sub(":", content)

    return content.strip()


def build_folder(source_folder, target_folder):
    """Write every stylesheet of a folder into another one, minified.

    The folders it holds are walked in turn, so the tree of the target is the
    one of the source. A file that is not a stylesheet is copied as it is: a
    stylesheet may point at it, and the paths are the same on both sides.

    :param source_folder: (str) The folder to read.
    :param target_folder: (str) The folder to write.
    :returns: (tuple) How many bytes were read, and how many were written.

    """
    read = 0
    written = 0

    if os.path.exists(target_folder) is False:
        os.makedirs(target_folder)

    for name in sorted(os.listdir(source_folder)):
        source = os.path.join(source_folder, name)
        target = os.path.join(target_folder, name)

        if os.path.isdir(source) is True:
            folder_read, folder_written = build_folder(source, target)
            read = read + folder_read
            written = written + folder_written
            continue

        if name.endswith(".css") is False:
            shutil.copyfile(source, target)
            continue

        with open(source, "r", encoding="utf-8") as fp:
            content = fp.read()

        minified = minify(content)

        with open(target, "w", encoding="utf-8") as fp:
            fp.write(minified)

        read = read + len(content.encode("utf-8"))
        written = written + len(minified.encode("utf-8"))
        print(f"  {source} → {len(content):>7} → {len(minified):>7}")

    return read, written


if __name__ == "__main__":

    if os.path.exists(CSS_FOLDER) is False:
        raise FileNotFoundError(f"Missing folder: {CSS_FOLDER}. "
                                f"This script is launched from the root of the repository.")

    # The target is written again from nothing: a stylesheet removed from the
    # source would otherwise be served forever from the minified folder.
    if os.path.exists(CSS_MIN_FOLDER) is True:
        shutil.rmtree(CSS_MIN_FOLDER)

    print(f"Minifying {CSS_FOLDER} into {CSS_MIN_FOLDER}:")
    total_read, total_written = build_folder(CSS_FOLDER, CSS_MIN_FOLDER)

    if total_read == 0:
        print("No stylesheet was found.")
    else:
        saved = 100 * (total_read - total_written) / total_read
        print(f"Read {total_read} bytes, written {total_written} bytes: {saved:.0f} % less.")
