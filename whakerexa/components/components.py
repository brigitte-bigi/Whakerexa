# -*- coding: UTF-8 -*-
"""
:filename: whakerexa.components.components.py
:author:   Florian LOPITAUX
:contact:  contact@sppas.org
:summary:  Enumeration of all components that contains the required files.

.. This file is part of Whakerexa: https://sourceforge.net/projects/whakerexa/
..
    -------------------------------------------------------------------------

    Copyright (C) 2024  Brigitte Bigi
    Laboratoire Parole et Langage, Aix-en-Provence, France

    Use of this software is governed by the GNU Public License, version 3.

    Whakerexa is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Whakerexa is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Whakerexa. If not, see <https://www.gnu.org/licenses/>.

    This banner notice must not be removed.

    -------------------------------------------------------------------------

"""

from enum import Enum

# ---------------------------------------------------------------------------


class ComponentsEnum(Enum):
    VideoPopup = ["video_popup.css", "video_popup.js"]
    Book = ["book.css", "book.js"]
    Cards = ["cards.css"]
