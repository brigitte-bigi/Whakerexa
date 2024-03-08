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

from whakerpy.htmlmaker import HTMLNode
from whakerpy.htmlmaker import HTMLHeadNode
from whakerpy.httpd import BaseResponseRecipe
from whakerpy.httpd import HTTPDStatus

# ---------------------------------------------------------------------------


class ExtendHeadNode(HTMLHeadNode):

    def __init__(self, parent, title):
        """Create the head node.

        """
        super(ExtendHeadNode, self).__init__(parent)
        self.reset(title)

    # -----------------------------------------------------------------------
    # PUBLIC METHODS
    # -----------------------------------------------------------------------

    def reset(self, title):
        """Reset the head to its default values.

        """
        # Delete the existing list of children
        self._children = list()

        # The default meta tags
        self.meta({"charset": "utf-8"})
        self.meta({"http-equiv": "X-UA-Compatible", "content": "IE=edge"})
        self.meta({"name": "viewport",
                   "content": "width=device-width, initial-scale=1.0, user-scalable=yes"})

        # Add a default title
        title_node = HTMLNode(self.identifier, "title", "title", value=title)
        self.append_child(title_node)

        # Add the CSS style of any dynamic page
        self.__import_css_styles()

        # Add the javascript with utility functions
        self.__import_js_scripts()

    # ---------------------------------------------------------------------------
    # PRIVATE METHODS
    # ---------------------------------------------------------------------------

    def __import_css_styles(self) -> None:
        """Import statics css styles of the whakerexa library.

        """
        self.link(rel="stylesheet", href=os.path.join("statics", "css", "video_player.css"), link_type="text/css")

    # ---------------------------------------------------------------------------

    def __import_js_scripts(self) -> None:
        """Import statics js scripts of the whakerexa library.

        """
        # import PureJS-Tools scripts
        self.script(os.path.join("statics", "js", "purejs-tools", "OnLoadManager.js"), "text/javascript")

        # import Whakerexa scripts
        self.script(os.path.join("statics", "js", "accessibility.js"), "text/javascript")


# ---------------------------------------------------------------------------


class ExtendResponseRecipe(BaseResponseRecipe):

    def __init__(self, name="und", tree=None, title="Whakerexa"):
        super(ExtendResponseRecipe, self).__init__(name, tree)

        self.__unittest_files = list()

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
            self._htree.head.script(os.path.join("statics", "js", "purejs-tools", "UnitTest.js"), "text/javascript")

        for file_path in self.__unittest_files:
            if os.path.basename(file_path) not in serialize_head:
                self._htree.head.script(file_path, "text/javascript")

    # ---------------------------------------------------------------------------

    def create(self) -> None:
        self._htree.head = ExtendHeadNode(self._htree.identifier, self._name)

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
