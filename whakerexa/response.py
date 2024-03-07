"""
:filename: whakerexa.response.py
:author:   Florian LOPITAUX
:contact:  contact@sppas.org
:summary:  Extend the BaseResponseRecipe to add automatically the new features of the Whakerexa library

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

from whakerexa.whakerpy import BaseResponseRecipe
from whakerexa.whakerpy import HTTPDStatus

# ---------------------------------------------------------------------------


class ExtendResponseRecipe(BaseResponseRecipe):

    def __init__(self, name="und", tree=None):
        super(ExtendResponseRecipe, self).__init__(name, tree)

        self.__unittest_files = list()

        self.__import_css_styles()
        self.__import_js_scripts()

        self._status = HTTPDStatus()

    # ---------------------------------------------------------------------------
    # SETTERS
    # ---------------------------------------------------------------------------

    def add_unittest_file(self, file_path: str) -> None:
        """Add a new unit test file to the list.
        If you want to use this files when the webapp start, called the 'enable_unit_tests' method.

        :param file_path: The path of the unit test file to add

        :raises FileNotFoundError: If the given file path doesn't exist

        """
        if os.path.exists(file_path):
            self.__unittest_files.append(file_path)
        else:
            raise FileNotFoundError(f"The given file : {file_path} doesn't exist !")

    # ---------------------------------------------------------------------------
    # PUBLIC METHODS
    # ---------------------------------------------------------------------------

    def enable_unittests(self) -> None:
        """Import unit test files append before in the html head.

        """
        serialize_head = self._htree.head.serialize()

        if "UnitTest.js" not in serialize_head:
            self._htree.head.script(src=os.path.join("statics", "js", "purejs-tools", "UnitTest.js"))

        for file_path in self.__unittest_files:
            if os.path.basename(file_path) not in serialize_head:
                self._htree.head.script(file_path)

    # ---------------------------------------------------------------------------
    # OVERRIDE METHODS
    # ---------------------------------------------------------------------------

    def _invalidate(self):
        """Remove all children nodes of the body "main".
        Delete the body main content and nothing else.

        """
        node = self._htree.body_main
        for i in reversed(range(node.children_size())):
            node.pop_child(i)

    # ---------------------------------------------------------------------------
    # PRIVATE METHODS
    # ---------------------------------------------------------------------------

    def __import_css_styles(self) -> None:
        """Import statics css styles of the whakerexa library.

        """
        pass

    # ---------------------------------------------------------------------------

    def __import_js_scripts(self) -> None:
        """Import statics js scripts of the whakerexa library.

        """
        # import PureJS-Tools scripts
        self._htree.head.script(src=os.path.join("statics", "js", "purejs-tools", "OnLoadManager.js"))

        # import Whakerexa scripts
        self._htree.head.script(src=os.path.join("statics", "js", "accessibility.js"))
