#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
:filename: check_namespace.py
:author: Brigitte Bigi
:contact: contact@sppas.org
:summary: Check that a page finds the same names, whichever way it loads.

The framework is loaded two ways: the modules over http, one file from a disk.
The loader reads names on it -- wexa.ThemeManager, wexa.REFERENCE_THEMES --
and those names have to be there both ways. A name exported and not held on
the namespace answers over http and not from a disk; a name held and not
exported does the opposite. Nothing says it until a reader opens the page the
way that fails.

The script reads what the loader asks for, and looks for each name where it
would have to be: in wexa.bundle.js, which is what a disk reads, and in what
wexa.js exports or imports for the modules, which is what http reads.

Exits with 1 when a name is missing on one side, so that it belongs with the
bundle rebuild, before a commit.

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
NAMESPACE_FILE = os.path.join("wexa_statics", "js", "wexa.js")
BUNDLE_FILE = os.path.join("wexa_statics", "js", "wexa.bundle.js")
LOADER_FILE = os.path.join("wexa_statics", "js", "wexa.loader.js")

# ---------------------------------------------------------------------------


def block_of(text, opening, closing):
    """Give what stands between two marks.

    :param text: (str) What to read.
    :param opening: (str) What opens the block.
    :param closing: (str) What closes it.
    :return: (str) What stands between, without the marks.

    """
    start = text.find(opening)
    if start == -1:
        return ""

    end = text.find(closing, start + len(opening))
    if end == -1:
        return ""

    return text[start + len(opening):end]

# ---------------------------------------------------------------------------


def names_of(block):
    """Give the names a block of wexa.js says.

    A name stands on its own line, alone or followed by a comma, and a
    singleton is written 'name: Something'.

    :param block: (str)
    :return: (set of str)

    """
    said = set()
    for line in block.split("\n"):
        written = line.strip()
        if written == "" or written.startswith("//") is True:
            continue

        found = re.match(r"^([A-Za-z_][A-Za-z0-9_]*)\s*(?::|,|$)", written)
        if found is not None:
            said.add(found.group(1))

    return said

# ---------------------------------------------------------------------------


def without_words(text):
    """Remove what is written for a reader, and what is written in a string.

    A comment and a string may hold anything, 'wexa.bundle.js' among others,
    and neither is a name read on the framework.

    :param text: (str)
    :return: (str)

    """
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.DOTALL)
    text = re.sub(r"//[^\n]*", "", text)
    text = re.sub(r"'[^']*'", "''", text)
    text = re.sub(r'"[^"]*"', '""', text)
    return text


# ---------------------------------------------------------------------------


def body_of(text, name):
    """Give the body of a function, braces counted.

    :param text: (str) The file.
    :param name: (str) The name of the function.
    :return: (str) What stands between its braces, or "" when it is not there.

    """
    found = re.search(r"function\s+" + name + r"\s*\([^)]*\)\s*\{", text)
    if found is None:
        return ""

    depth = 0
    for index in range(found.end() - 1, len(text)):
        if text[index] == "{":
            depth += 1
        elif text[index] == "}":
            depth -= 1
            if depth == 0:
                return text[found.end():index]

    return ""


# ---------------------------------------------------------------------------


def read_in(text):
    """Give the names read on the framework in a piece of code.

    :param text: (str)
    :return: (set of str)

    """
    return set(re.findall(r"(?:wexa|namespace|window\.Wexa)\.([A-Za-z_][A-Za-z0-9_]*)",
                          without_words(text)))


# ---------------------------------------------------------------------------


def held_by_bundle(text):
    """Give the names a document read from a disk finds on the namespace.

    The build writes one line per exported class, and wexa.js writes the rest
    in the object it assigns.

    :param text: (str) The bundle.
    :return: (set of str)

    """
    said = set(re.findall(r"window\.Wexa\.([A-Za-z_][A-Za-z0-9_]*)\s*=", text))
    said |= names_of(block_of(text, "window.Wexa = Object.assign(window.Wexa || {}, {", "});"))
    return said


# ---------------------------------------------------------------------------


def exported_by(path):
    """Give the names a module exports.

    :param path: (str)
    :return: (set of str)

    """
    if os.path.isfile(path) is False:
        return set()

    source = open(path, "r", encoding="utf-8").read()
    said = set(re.findall(r"export\s+(?:const|class|function|let)\s+([A-Za-z_][A-Za-z0-9_]*)",
                          source))
    for block in re.findall(r"export\s*\{([^}]*)\}", source):
        said |= names_of(block)

    return said


# ---------------------------------------------------------------------------


def imported_by_loader(loader):
    """Give the names the loader imports beside wexa.js.

    :param loader: (str) The loader.
    :return: (set of str)

    """
    said = set()
    for module in re.findall(r"import\(addressOf\('([^']+)'\)\)", loader):
        if module.endswith("js/wexa.js") is True:
            continue
        said |= exported_by(os.path.join("wexa_statics", module))

    return said


# ---------------------------------------------------------------------------


def main():
    """Look for what the loader asks, on both sides."""
    for path in (NAMESPACE_FILE, BUNDLE_FILE, LOADER_FILE):
        if os.path.isfile(path) is False:
            print("File not found: %s. Run from the root of the repository." % path)
            return 1

    namespace = open(NAMESPACE_FILE, "r", encoding="utf-8").read()
    bundle = open(BUNDLE_FILE, "r", encoding="utf-8").read()
    loader = open(LOADER_FILE, "r", encoding="utf-8").read()

    # Where the loader reads decides what answers it: the modules it imported,
    # or the object the bundle left on the window.
    over_http = read_in(body_of(loader, "loadModules"))
    on_disk = read_in(body_of(loader, "loadBundle"))

    if len(over_http) == 0 and len(on_disk) == 0:
        print("Neither loadModules() nor loadBundle() was found in %s." % LOADER_FILE)
        return 1

    answers_http = exported_by(NAMESPACE_FILE) | imported_by_loader(loader)
    answers_disk = held_by_bundle(bundle)

    print("loadModules() reads %d names, loadBundle() reads %d."
          % (len(over_http), len(on_disk)))
    print("")

    held = True
    for title, asked, answers in (
            ("a served document, from what the modules export", over_http, answers_http),
            ("a document read from a disk, from what the bundle holds", on_disk, answers_disk)):
        missing = sorted(asked - answers)
        if len(missing) > 0:
            held = False
            print("Read by the loader, and not found by %s:" % title)
            for name in missing:
                print("    %s" % name)
            print("")

    if held is True:
        print("A page finds every name it asks for, whichever way it loads.")
        return 0

    print("A page does not find the same names.")
    return 1


# ---------------------------------------------------------------------------


if __name__ == "__main__":
    sys.exit(main())
