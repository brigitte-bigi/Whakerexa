#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
:filename: build_fonts_subsets.py
:author: Brigitte Bigi
:contact: contact@sppas.org
:summary: Split the Whakerexa fonts into unicode-range subsets.

Each source font is cut into several woff2 files, one per script block
(latin, latin extended, greek, cyrillic...). No character is lost: the
codepoints belonging to no known block are gathered into a last file. Every
codepoint is written in exactly one subset, so the browser downloads a block
only when the page actually contains one of its characters.

The script writes the woff2 files next to their source and prints the
@font-face rules to paste into wexa_statics/css/wexa.css.

It requires fontTools and brotli:
    pip install "fonttools[woff]"

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
import unicodedata

from fontTools.pens.boundsPen import BoundsPen
from fontTools.subset import Options
from fontTools.subset import Subsetter
from fontTools.ttLib import TTFont

# Unicode categories of the characters a font is expected to draw nothing for.
BLANK_CATEGORIES = ("Zs", "Zl", "Zp", "Cc", "Cf")

# Inputs and outputs
FONTS_FOLDER = os.path.join("wexa_statics", "fonts")

# The source fonts, with the @font-face descriptors they are declared with.
# The order is the one of wexa.css.
FONT_FACES = [
    {"source": "Commissioner.woff2",
     "family": "SansFont",
     "descriptors": ["font-display: swap;"]},

    {"source": "SourceSerifPro.woff2",
     "family": "SerifFont",
     "descriptors": ["font-display: swap;"]},

    {"source": "AccessibleDfA-Regular.woff2",
     "family": "ContrastFont",
     "descriptors": ["font-style: normal;", "font-weight: normal;"]},

    {"source": "AccessibleDfA-Italic.woff2",
     "family": "ContrastFont",
     "descriptors": ["font-weight: normal;", "font-style: italic;"]},

    {"source": "AccessibleDfA-Bold.woff2",
     "family": "ContrastFont",
     "descriptors": ["font-style: normal;", "font-weight: bold;"]},
]

# The script blocks, in the order codepoints are assigned to them. A codepoint
# claimed by an earlier block is not offered to the following ones, so the
# subsets never overlap and a character is never downloaded twice.
BLOCKS = [
    ("latin", [(0x0000, 0x00FF), (0x0131, 0x0131), (0x0152, 0x0153),
               (0x02BB, 0x02BC), (0x02C6, 0x02C6), (0x02DA, 0x02DA),
               (0x02DC, 0x02DC), (0x2000, 0x206F), (0x2074, 0x2074),
               (0x20AC, 0x20AC), (0x2122, 0x2122), (0x2191, 0x2191),
               (0x2193, 0x2193), (0x2212, 0x2212), (0x2215, 0x2215),
               (0xFEFF, 0xFEFF), (0xFFFD, 0xFFFD)]),

    ("latin-ext", [(0x0100, 0x02AF), (0x0300, 0x036F), (0x1E00, 0x1E9F),
                   (0x1EF2, 0x1EFF), (0x2020, 0x2020), (0x20A0, 0x20AB),
                   (0x20AD, 0x20C0), (0x2113, 0x2113), (0x2C60, 0x2C7F),
                   (0xA720, 0xA7FF)]),

    ("vietnamese", [(0x1EA0, 0x1EF1)]),

    ("greek", [(0x0370, 0x03FF)]),

    ("greek-ext", [(0x1F00, 0x1FFF)]),

    ("cyrillic", [(0x0400, 0x045F), (0x0490, 0x0491), (0x04B0, 0x04B1),
                  (0x2116, 0x2116)]),

    ("cyrillic-ext", [(0x0460, 0x052F), (0x1C80, 0x1C88), (0x2DE0, 0x2DFF),
                      (0xA640, 0xA69F), (0xFE2E, 0xFE2F)]),
]

# Name of the subset gathering the codepoints of no listed block.
OTHER_BLOCK = "other"

# ---------------------------------------------------------------------------


def font_codepoints(font_path):
    """Return the set of codepoints a font really draws.

    A font may map a codepoint to an empty glyph: it then claims a character
    it does not draw, and the browser displays nothing instead of falling back
    to the next family. Such codepoints are left out, so that the subsets and
    their unicode-range only announce what the font actually shows. Spaces and
    control characters are kept, since drawing nothing is their purpose.

    :param font_path: (str)
    :return: (set)

    """
    font = TTFont(font_path)
    glyph_set = font.getGlyphSet()
    codepoints = set()

    for codepoint, glyph_name in font.getBestCmap().items():
        if unicodedata.category(chr(codepoint)) in BLANK_CATEGORIES:
            codepoints.add(codepoint)
            continue

        pen = BoundsPen(glyph_set)
        glyph_set[glyph_name].draw(pen)
        if pen.bounds is not None:
            codepoints.add(codepoint)

    font.close()
    return codepoints

# ---------------------------------------------------------------------------


def split_codepoints(codepoints):
    """Assign each codepoint to the first block claiming it.

    :param codepoints: (set) The codepoints a font provides
    :return: (list) Tuples of a block name and its set of codepoints

    """
    remaining = set(codepoints)
    assigned = list()

    for block_name, ranges in BLOCKS:
        claimed = set()
        for first, last in ranges:
            claimed.update(value for value in remaining if first <= value <= last)
        if len(claimed) > 0:
            assigned.append((block_name, claimed))
            remaining -= claimed

    if len(remaining) > 0:
        assigned.append((OTHER_BLOCK, remaining))

    return assigned

# ---------------------------------------------------------------------------


def compact_ranges(codepoints):
    """Turn a set of codepoints into the CSS unicode-range notation.

    :param codepoints: (set)
    :return: (str)

    """
    values = sorted(codepoints)
    entries = list()
    first = values[0]
    previous = values[0]

    for value in values[1:]:
        if value == previous + 1:
            previous = value
            continue
        entries.append((first, previous))
        first = value
        previous = value
    entries.append((first, previous))

    written = list()
    for start, end in entries:
        if start == end:
            written.append("U+%04X" % start)
        else:
            written.append("U+%04X-%04X" % (start, end))

    return ", ".join(written)

# ---------------------------------------------------------------------------


def write_subset(font_path, codepoints, output_path):
    """Write a woff2 file holding the given codepoints only.

    :param font_path: (str) The source font
    :param codepoints: (set) The codepoints to keep
    :param output_path: (str) The woff2 file to write
    :return: (int) The size in bytes of the written file

    """
    options = Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.notdef_outline = True

    font = TTFont(font_path)
    subsetter = Subsetter(options=options)
    subsetter.populate(unicodes=codepoints)
    subsetter.subset(font)
    font.save(output_path)
    font.close()

    return os.path.getsize(output_path)

# ---------------------------------------------------------------------------


def font_face_rule(family, file_name, descriptors, unicode_range):
    """Return the @font-face rule of one subset.

    :param family: (str) The CSS font family name
    :param file_name: (str) The woff2 file name
    :param descriptors: (list) The descriptors of the source declaration
    :param unicode_range: (str) The CSS unicode-range value
    :return: (str)

    """
    lines = list()
    lines.append("@font-face {")
    lines.append("    font-family: %s;" % family)
    lines.append("    src: url('../fonts/%s') format('woff2');" % file_name)
    for descriptor in descriptors:
        lines.append("    %s" % descriptor)
    lines.append("    unicode-range: %s;" % unicode_range)
    lines.append("}")

    return "\n".join(lines)

# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------


if __name__ == '__main__':

    rules = list()
    total_source = 0
    total_subsets = 0

    for face in FONT_FACES:

        source_path = os.path.join(FONTS_FOLDER, face["source"])
        if os.path.exists(source_path) is False:
            raise FileNotFoundError('Missing font: %s' % source_path)

        stem = face["source"][:-len(".woff2")]
        source_size = os.path.getsize(source_path)
        total_source += source_size
        print("%s (%d bytes)" % (face["source"], source_size))

        for block_name, block_codepoints in split_codepoints(font_codepoints(source_path)):

            file_name = "%s-%s.woff2" % (stem, block_name)
            output_path = os.path.join(FONTS_FOLDER, file_name)
            written = write_subset(source_path, block_codepoints, output_path)
            total_subsets += written

            print("    %-28s %6d chars %8d bytes" % (file_name, len(block_codepoints), written))
            rules.append(font_face_rule(face["family"], file_name, face["descriptors"],
                                        compact_ranges(block_codepoints)))

    print("\nSources: %d bytes -- subsets: %d bytes" % (total_source, total_subsets))
    print("\n----- @font-face rules for wexa_statics/css/wexa.css -----\n")
    print("\n\n".join(rules))
