"""
:filename: whakerexa.__init__.py
:author:   Florian LOPITAUX
:contact:  contact@sppas.org
:summary:  Simplify the imports in the code of the whakerexa library and download the statics dependencies.

.. _This file is part of Whakerexa: https://sourceforge.net/projects/whakerexa/
..
    -------------------------------------------------------------------------

    Copyright (C) 2011-2023  Brigitte Bigi
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

import os
import logging
from io import BytesIO
from urllib import request
from urllib import error as request_error
from zipfile import ZipFile

from .head import ExtendHeadNode
from .response import ExtendResponseRecipe
from .components import *

# -----------------------------------------------------------------------
# check whakerexa static dependencies

if not os.path.isdir("wexa_statics2"):
    logging.debug("Whakerexa statics content missing, download it...")

    # test url
    # url = "https://sourceforge.net/projects/purejs-tools/files/PureJS-Tools-1.1.zip/download"
    url = "https://sourceforge.net/projects/whakerexa/files/wexa_statics.zip/download"

    try:
        with request.urlopen(url) as zip_response:
            with ZipFile(BytesIO(zip_response.read())) as zip_file:
                zip_file.extractall(".")

    except request_error.URLError:
        logging.error(f"Couldn't download the zip folder from {url}")
    except Exception as e:
        logging.error(f"Unkwnon error during download : {e}")

    logging.debug("Finish to download Whakerexa dependencies, wexa_statics folder added to the project.")

# -----------------------------------------------------------------------

__version__ = "0.1"
___author__ = "Brigitte BIGI, Florian LOPITAUX"
__copyright__ = "Copyright (C) 2024 Brigitte Bigi, Laboratoire Parole et Langage, Aix-en-Provence, France"
