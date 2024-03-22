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
import logging

from whakerpy.htmlmaker import HTMLNode
from whakerpy.htmlmaker import HTMLHeadNode

from .components import ComponentsEnum

# ---------------------------------------------------------------------------

CSS_FOLDER = os.path.join("wexa_statics", "css")
CSS_MIME_TYPE = "text/css"
JS_FOLDER = os.path.join("wexa_statics", "js")
JS_MIME_TYPE = "application/javascript"

# ---------------------------------------------------------------------------


class ExtendHeadNode(HTMLHeadNode):

    def __init__(self, parent, title):
        """Create the head node.

        """
        super(ExtendHeadNode, self).__init__(parent)
        self.__components_activated = list()

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

    def enable_component(self, component: ComponentsEnum) -> None:
        """Import styles and scripts files for a specific given component to use it.

        :param component: (Components) The component to enable

        """
        if component.name in self.__components_activated:
            logging.warning(f"The component '{component.name}' is already enabled !")
            return None

        for file in component.value:
            if file.endswith(".css"):
                self.link(rel="stylesheet", href=os.path.join(CSS_FOLDER, file), link_type=CSS_MIME_TYPE)
            elif file.endswith(".js"):
                self.script(os.path.join(JS_FOLDER, file), script_type=JS_MIME_TYPE)
            else:
                logging.warning(f"Unknown required file : {file} for the component '{component.name}'")

        self.__components_activated.append(component.name)

    # ---------------------------------------------------------------------------
    # PRIVATE METHODS
    # ---------------------------------------------------------------------------

    def __import_css_styles(self) -> None:
        """Import statics css global styles of the whakerexa library.

        """
        self.link(rel="stylesheet", href=os.path.join(CSS_FOLDER, "wexa.css"), link_type=CSS_MIME_TYPE)
        self.link(rel="stylesheet", href=os.path.join(CSS_FOLDER, "panel.css"), link_type=CSS_MIME_TYPE)

    # ---------------------------------------------------------------------------

    def __import_js_scripts(self) -> None:
        """Import statics js scripts of the whakerexa library.

        """
        # import Whakerpy scripts
        self.script(os.path.join(JS_FOLDER, "whakerpy", "request.js"), script_type=JS_MIME_TYPE)

        # import PureJS-Tools scripts
        self.script(os.path.join(JS_FOLDER, "purejs-tools", "OnLoadManager.js"), script_type=JS_MIME_TYPE)

        # import Whakerexa global scripts
        self.script(os.path.join(JS_FOLDER, "accessibility.js"), script_type=JS_MIME_TYPE)
