"""
:filename: whakerexa.head.py
:author:   Florian LOPITAUX
:contact:  contact@sppas.org
:summary:  Extend the HTMLHeadNode to import by default our css and js files and set metadata.

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

# ---------------------------------------------------------------------------


class ExtendHeadNode(HTMLHeadNode):

    def __init__(self, parent, title):
        """Create the head node.

        """
        super(ExtendHeadNode, self).__init__(parent)
        self.reset(title)

    # ---------------------------------------------------------------------------
    # PUBLIC METHODS
    # ---------------------------------------------------------------------------

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

    def set_keywords_metadata(self, keywords: str) -> None:
        """Set the keywords for the webapp, this is useful for the referencing of search motor.

        :param keywords: The keywords that define the webapp,
                         the keywords has to be in a string format with space character separator.

        """
        self.meta({"name": "keywords", "content": keywords})

    # ---------------------------------------------------------------------------
    # PRIVATE METHODS
    # ---------------------------------------------------------------------------

    def __import_css_styles(self) -> None:
        """Import statics css styles of the whakerexa library.

        """
        self.link(rel="stylesheet", href=os.path.join("statics", "css", "wexa.css"), link_type="text/css")
        self.link(rel="stylesheet", href=os.path.join("statics", "css", "video_player.css"), link_type="text/css")

    # ---------------------------------------------------------------------------

    def __import_js_scripts(self) -> None:
        """Import statics js scripts of the whakerexa library.

        """
        # import PureJS-Tools scripts
        self.script(os.path.join("statics", "js", "purejs-tools", "OnLoadManager.js"), "text/javascript")

        # import Whakerexa scripts
        self.script(os.path.join("statics", "js", "accessibility.js"), "text/javascript")
