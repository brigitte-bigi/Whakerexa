#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
:filename: check_ecodesign.py
:author: Brigitte Bigi
:contact: contact@sppas.org
:summary: Measure what Whakerexa asks a browser to download.

Eco-design is answered with figures, not with intentions. This script reads
what the framework serves -- wexa_statics/ and nothing else, the documentation
and its media being outside the perimeter -- and says what it weighs, what it
asks for, and what it borrows from elsewhere.

It reports three things a referential asks for and that a repository can
answer on its own: the weight of a typical load, the absence of any dependency
served from another domain, and the way the fonts are cut so that a page
downloads only the blocks it displays.

The bundle is measured apart. wexa.loader.js serves the modules over HTTP and
takes the bundle on file:// alone, so a served page never downloads it: adding
it to a load would count what nobody receives.

Exits with 1 when a stylesheet or a script served to a page names a resource
held on another domain, that being the one rule and not a measurement.

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
STATICS_FOLDER = "wexa_statics"

# What a served page loads: the minified stylesheet, one theme, the loader,
# and the modules the loader pulls.
TYPICAL_LOAD = [
    os.path.join("css.min", "wexa.css"),
    os.path.join("css.min", "themes", "wexa_theme.css"),
    os.path.join("js", "wexa.loader.js"),
]

# What the loader pulls is read from this file, and from what it imports.
ENTRY_MODULE = os.path.join("js", "wexa.js")

# The one that is read on file:// instead of the modules.
BUNDLE = os.path.join("js", "wexa.bundle.js")

# The folders the report walks, and the name each one is given.
GROUPS = [
    ("Stylesheets, minified", "css.min"),
    ("Stylesheets, source", "css"),
    ("Scripts", "js"),
    ("Fonts", "fonts"),
    ("Icons", "icons"),
    ("Logos", "logos"),
]

# What is served to a page, and must therefore borrow nothing.
SERVED_SUFFIXES = (".css", ".js")

# A resource held elsewhere: a scheme, or a protocol-relative address.
ELSEWHERE = re.compile(r"""url\(\s*['"]?(?:https?:)?//""", re.IGNORECASE)

# ---------------------------------------------------------------------------


def weight_of(path):
    """Give the weight of a file.

    :param path: (str)
    :return: (int) Its size in bytes, 0 when it is not there.

    """
    if os.path.isfile(path) is False:
        return 0
    return os.path.getsize(path)

# ---------------------------------------------------------------------------


def said(size):
    """Say a weight the way a report reads it.

    :param size: (int) A number of bytes.
    :return: (str)

    """
    if size < 1024:
        return "%d o" % size
    if size < 1024 * 1024:
        return "%.1f Ko" % (size / 1024.0)
    return "%.2f Mo" % (size / (1024.0 * 1024.0))

# ---------------------------------------------------------------------------


def files_of(folder):
    """Give the files a folder holds, its subfolders included.

    :param folder: (str)
    :return: (list of str) The paths, in order.

    """
    found = []
    for root, folders, names in os.walk(folder):
        folders.sort()
        for name in sorted(names):
            found.append(os.path.join(root, name))
    return found

# ---------------------------------------------------------------------------


def modules_pulled():
    """Give the modules a page loads over HTTP.

    What a page pulls is what wexa.js imports, and what those imports import
    in turn -- and that alone. The list the bundle is written from says more:
    it holds the extras, which a page loads only when it names them.

    :return: (list of str) The paths, from the base of the repository.

    """
    entry = os.path.join(STATICS_FOLDER, ENTRY_MODULE)
    if os.path.isfile(entry) is False:
        return []

    reached = []
    waiting = [entry]

    while len(waiting) > 0:
        path = os.path.normpath(waiting.pop())
        if path in reached or os.path.isfile(path) is False:
            continue
        reached.append(path)

        text = open(path, "r", encoding="utf-8", errors="replace").read()
        for target in re.findall(r"^\s*import\s+[^'\"]*['\"]([^'\"]+)['\"]",
                                 text, re.MULTILINE):
            if target.startswith(".") is True:
                waiting.append(os.path.join(os.path.dirname(path), target))

    return reached

# ---------------------------------------------------------------------------


def borrowed(path):
    """Say what a served file asks another domain for.

    :param path: (str) A stylesheet or a script.
    :return: (list of str) The lines that name an address elsewhere.

    """
    lines = []
    with open(path, "r", encoding="utf-8", errors="replace") as source:
        for number, line in enumerate(source, start=1):
            if ELSEWHERE.search(line) is not None:
                lines.append("%s:%d" % (path, number))
    return lines

# ---------------------------------------------------------------------------


def report_load():
    """Write what a served page downloads.

    :return: (int) The weight of that load.

    """
    print("A page that is served")
    print("-" * 60)

    total = 0
    for name in TYPICAL_LOAD:
        path = os.path.join(STATICS_FOLDER, name)
        size = weight_of(path)
        total += size
        print("    %-42s %10s" % (name, said(size)))

    modules = modules_pulled()
    weight = sum(weight_of(path) for path in modules)
    total += weight
    print("    %-42s %10s" % ("wexa.js and the %d it imports" % (len(modules) - 1),
                              said(weight)))

    print("    %-42s %10s" % ("", "-" * 10))
    print("    %-42s %10s" % ("what the browser asks for", said(total)))
    print("    %-42s %10d" % ("requests it makes", len(TYPICAL_LOAD) + len(modules)))
    print("")

    bundle = weight_of(os.path.join(STATICS_FOLDER, BUNDLE))
    print("    Read on file:// instead of the modules: %s (%s)"
          % (BUNDLE, said(bundle)))
    print("")

    return total

# ---------------------------------------------------------------------------


def report_groups():
    """Write what each folder of the framework weighs.

    :return: (int) The weight of everything the framework carries.

    """
    print("What the framework carries")
    print("-" * 60)

    total = 0
    for title, folder in GROUPS:
        path = os.path.join(STATICS_FOLDER, folder)
        if os.path.isdir(path) is False:
            continue

        files = files_of(path)
        weight = sum(weight_of(name) for name in files)
        total += weight
        print("    %-24s %4d files %14s" % (title, len(files), said(weight)))

    print("    %-24s %4s %14s" % ("", "", "-" * 14))
    print("    %-24s %4s %14s" % ("all of it", "", said(total)))
    print("")

    return total

# ---------------------------------------------------------------------------


def report_fonts():
    """Write how the fonts are cut, and what one block weighs.

    A page downloads the blocks it displays and no other, which asks for a
    @font-face per block, each one with its unicode-range.

    :return: (None)

    """
    print("Fonts, block by block")
    print("-" * 60)

    folder = os.path.join(STATICS_FOLDER, "fonts")
    if os.path.isdir(folder) is False:
        print("    No font is served.")
        print("")
        return

    faces = 0
    ranges = 0
    for path in files_of(os.path.join(STATICS_FOLDER, "css")):
        if path.endswith(".css") is False:
            continue
        text = open(path, "r", encoding="utf-8", errors="replace").read()
        for block in re.findall(r"@font-face\s*\{[^}]*\}", text):
            faces += 1
            if "unicode-range" in block:
                ranges += 1

    files = [path for path in files_of(folder) if path.endswith(".woff2")]
    weight = sum(weight_of(path) for path in files)

    print("    %-42s %10d" % ("faces declared", faces))
    print("    %-42s %10d" % ("of them cut by unicode-range", ranges))
    print("    %-42s %10d" % ("files served", len(files)))
    print("    %-42s %10s" % ("all of them", said(weight)))
    if len(files) > 0:
        heaviest = max(files, key=weight_of)
        print("    %-42s %10s" % ("the heaviest block, " + os.path.basename(heaviest),
                                  said(weight_of(heaviest))))
    if faces > ranges:
        print("    %d face(s) download whole, whatever the page displays."
              % (faces - ranges))
    print("")

# ---------------------------------------------------------------------------


def report_minified():
    """Write what minifying saves, stylesheet by stylesheet.

    :return: (None)

    """
    print("What minifying saves")
    print("-" * 60)

    source = os.path.join(STATICS_FOLDER, "css")
    minified = os.path.join(STATICS_FOLDER, "css.min")
    if os.path.isdir(minified) is False:
        print("    No minified stylesheet is served.")
        print("")
        return

    read = 0
    written = 0
    for path in files_of(source):
        if path.endswith(".css") is False:
            continue
        other = path.replace(source, minified, 1)
        if os.path.isfile(other) is False:
            print("    %-42s %10s" % (os.path.relpath(path, source), "not minified"))
            continue
        read += weight_of(path)
        written += weight_of(other)

    print("    %-42s %10s" % ("the stylesheets, as written", said(read)))
    print("    %-42s %10s" % ("the same, minified", said(written)))
    if read > 0:
        print("    %-42s %9d %%" % ("what is spared", 100 - (100 * written // read)))
    print("")

# ---------------------------------------------------------------------------


def report_borrowed():
    """Write what the framework asks another domain for.

    :return: (bool) True when it asks for nothing.

    """
    print("What is borrowed from elsewhere")
    print("-" * 60)

    found = []
    for folder in ("css", "css.min", "js"):
        path = os.path.join(STATICS_FOLDER, folder)
        if os.path.isdir(path) is False:
            continue
        for name in files_of(path):
            if name.endswith(SERVED_SUFFIXES) is True:
                found.extend(borrowed(name))

    if len(found) == 0:
        print("    Nothing: everything a page loads is served with it.")
        print("")
        return True

    for line in found:
        print("    %s" % line)
    print("")
    return False

# ---------------------------------------------------------------------------


def main():
    """Measure what the framework serves, and say it."""
    if os.path.isdir(STATICS_FOLDER) is False:
        print("Folder not found: %s. Run from the root of the repository."
              % STATICS_FOLDER)
        return 1

    print("")
    print("Whakerexa, what it asks a browser to download")
    print("=" * 60)
    print("")

    report_load()
    report_groups()
    report_fonts()
    report_minified()
    alone = report_borrowed()

    if alone is False:
        print("A page cannot be served without asking another domain.")
        return 1

    print("Measured. What a browser downloads is written above.")
    return 0

# ---------------------------------------------------------------------------


if __name__ == "__main__":
    sys.exit(main())
