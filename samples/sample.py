# -*- coding: UTF-8 -*-
"""
:filename: samples.sample.py
:author:   Florian LOPITAUX
:contact:  contact@sppas.org
:summary:  An example of custom response with ExtendResponseRecipe and other features of Whakerexa.

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

import os
import logging

from whakerpy import HTMLNode
from whakerexa import ExtendResponseRecipe
from whakerexa.components import ComponentsEnum
from whakerexa.components import VideoPopup
from whakerexa.components import Book
from whakerexa.components import Card

# -----------------------------------------------------------------------


class SampleAppResponse(ExtendResponseRecipe):

    def __init__(self) -> None:
        super(SampleAppResponse, self).__init__(name="Whakerexa Sample")
        self._htree.add_html_attribute("id", "whakerexa-sample")
        self.__import_unittest_files()

        self.enable_components(ComponentsEnum.VideoPopup, ComponentsEnum.Book, ComponentsEnum.Cards)
        # self.enable_unittests()  # activate the js unit tests

    # -----------------------------------------------------------------------

    @staticmethod
    def page() -> str:
        """Return the HTML page name."""
        return "whakerexa.html"

    # -----------------------------------------------------------------------

    def create(self):
        """Override. Create the fixed HTML page content.

        The fixed content corresponds to the parts that are not invalidated:
        head, body_header, body_footer, body_script.

        It can be created with htmlmaker, node by node, or loaded from a file.

        """
        # Add elements in the header
        h1 = HTMLNode(self._htree.body_header.identifier, None, "h1", value="Test of Whakerexa")
        self._htree.body_header.append_child(h1)

        # Add an element in the footer
        p = HTMLNode(self._htree.body_footer.identifier, None, "p", value="Copyleft 2024 Whakerexa")
        self._htree.body_footer.append_child(p)

    # -----------------------------------------------------------------------

    def _process_events(self, events) -> bool:
        """Process the given events coming from the POST of any form.

        :param events (dict): key=event_name, value=event_value
        :return: (bool) True if the whole page must be re-created.

        """
        logging.debug(" >>>>> Page whakerpy.html -- Process events: {} <<<<<< ".format(events))
        self._status.code = 200
        return True

    # -----------------------------------------------------------------------

    def _bake(self):
        """Create the dynamic page content in HTML.

        (re-)Define dynamic content of the page (nodes that are invalidated).

        """
        # Create Table of Contents of the page
        self._htree.body_main.set_attribute("id", self._htree.body_main.identifier)

        toc = Book(self._htree.get_body_identifier(), "Whakerexa Sample", self._htree.head,
                   id_main_content=self._htree.body_main.identifier)
        toc.add_link("https://whakerexa.sf.net")

        self._htree.insert_body_child(toc)

        # uncomment this line if we want that the following heading is detected
        # toc.detect_only_numerate_headings(False)

        # heading not detected by the table of contents
        h2 = self.element("h2")
        h2.set_value("Heading not detected by the table of contents")

        # components section
        general_section = HTMLNode(self._htree.body_main.identifier, "components_section", "section",
                                   attributes={'class': "chapter"})
        self._htree.body_main.append_child(general_section)

        # title of the section
        h1 = HTMLNode(general_section.identifier, None, "h1", value="Whakerexa components")
        general_section.append_child(h1)

        # Add custom video player in the main (more accurate in 'ssection' for the table of contents takes in account)
        video_section = HTMLNode(general_section.identifier, "ssection_video", "section",
                                 attributes={'class': "ssection"})
        general_section.append_child(video_section)

        video_heading = HTMLNode(video_section.identifier, None, "h2", value="Custom video popup")
        video_popup = VideoPopup(video_section.identifier, os.path.join("samples", "demo_video.webm"), "demo")
        video_popup.set_img_width(35, "vw")

        video_section.append_child(video_heading)
        video_section.append_child(video_popup)

        # Add card elements
        card_section = HTMLNode(general_section.identifier, "ssection_card", "section",
                                attributes={'class': "ssection"})
        general_section.append_child(card_section)

        card_heading = HTMLNode(card_section.identifier, None, "h2", value="Custom full card")
        full_card = self.__create_full_card(card_section.identifier)

        card_section.append_child(card_heading)
        card_section.append_child(full_card)

    # -----------------------------------------------------------------------
    # PRIVATE METHODS
    # -----------------------------------------------------------------------

    def __import_unittest_files(self) -> None:
        """Added all js unit test files.
        To launch the unit tests, call the method : self.enable_unittests().

        """
        self.add_unittest_file(os.path.join("tests", "js", "requestTest.js"))
        self.add_unittest_file(os.path.join("tests", "js", "accessibilityTest.js"))

    # -----------------------------------------------------------------------

    def __create_full_card(self, parent_id: str) -> HTMLNode:
        full_card = Card(parent_id, "demo_full_card", is_full_card=True)

        header_title = HTMLNode(full_card.card_header.identifier, None, "h1", value="My super title card")
        full_card.card_header.append_child(header_title)

        main_text = HTMLNode(full_card.card_main.identifier, None, "p", value="""
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        """)
        full_card.card_main.append_child(main_text)

        footer_copyright = HTMLNode(full_card.card_footer.identifier, None, "p", value="Copyright @ 2024 Whakerexa")
        full_card.card_footer.append_child(footer_copyright)

        return full_card
