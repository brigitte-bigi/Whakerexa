# -*- coding: UTF-8 -*-
"""
:filename: whakerexa.components.book.py
:author:   Florian LOPITAUX
:contact:  contact@sppas.org
:summary:  Class to create a table of contents on the left-side of the page.

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

from whakerpy import HTMLNode
from whakerpy import HTMLHeadNode
from whakerpy import HTMLNavNode

# -----------------------------------------------------------------------

JS_VALUE = """
OnLoadManager.addLoadFunction(() => {
    let book = new Book("%s");
    book.fill_table();
});
"""

# -----------------------------------------------------------------------


class Book(HTMLNavNode):

    def __init__(self, parent_id: str, title: str, head: HTMLHeadNode, id_main_content: str = "main-content"):
        super(Book, self).__init__(parent_id)
        self.set_attribute("id", "nav-content")
        self.set_attribute("class", "side-nav")

        self.title_node = HTMLNode(self.identifier, None, "h1", value=title)

        self.__insert_script(head, id_main_content)
        self.__create()

    # -----------------------------------------------------------------------
    # GETTERS
    # -----------------------------------------------------------------------

    def get_title(self) -> str:
        return self.title_node.get_value()

    # -----------------------------------------------------------------------
    # SETTERS
    # -----------------------------------------------------------------------

    def set_tile(self, title: str) -> None:
        self.title_node.set_value(title)

    # -----------------------------------------------------------------------
    # PUBLIC METHODS
    # -----------------------------------------------------------------------

    def add_link(self, url: str) -> None:
        link = HTMLNode(self.identifier, None, "a", value=url, attributes={
            'class': "external-link",
            'href': url
        })

        self.insert_child(1, link)

    # -----------------------------------------------------------------------
    # PRIVATE METHODS
    # -----------------------------------------------------------------------

    def __insert_script(self, head: HTMLHeadNode, headings: str) -> None:
        book_script = HTMLNode(head.identifier, None, "script",
                               attributes={'type': "application/javascript"}, value=JS_VALUE.replace('%s', headings))
        head.append_child(book_script)

    # -----------------------------------------------------------------------

    def __create(self) -> None:
        h2 = HTMLNode(self.identifier, None, "h2", value="Table Of Contents")
        ul = HTMLNode(self.identifier, None, "ul", attributes={'id': "toc"})

        self.append_child(self.title_node)
        self.append_child(h2)
        self.append_child(ul)
