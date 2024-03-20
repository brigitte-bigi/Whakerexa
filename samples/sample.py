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

# -----------------------------------------------------------------------


class SampleAppResponse(ExtendResponseRecipe):

    def __init__(self) -> None:
        super(SampleAppResponse, self).__init__(name="Whakerexa Sample")
        self._htree.add_html_attribute("id", "whakerexa-sample")
        self.__import_unittest_files()

        self.enable_components(ComponentsEnum.VideoPopup, ComponentsEnum.Book)
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

        # heading not detected by the table of contents
        h2 = self.element("h2")
        h2.set_value("Heading not detected by the table of contents")

        # Add custom video player in the main (more accurate in 'ssection' for the table of contents takes in account)
        toc_section = HTMLNode(self._htree.body_main.identifier, "ssection", "section", attributes={'class': "ssection"})
        video_heading = HTMLNode(toc_section.identifier, None, "h2", value="Custom video popup")

        video_popup = VideoPopup(toc_section.identifier, os.path.join("samples", "demo_video.webm"), "demo")
        video_popup.set_img_width(35, "vw")

        toc_section.append_child(video_heading)
        toc_section.append_child(video_popup)
        self._htree.body_main.append_child(toc_section)

    # -----------------------------------------------------------------------
    # PRIVATE METHODS
    # -----------------------------------------------------------------------

    def __import_unittest_files(self) -> None:
        """Added all js unit test files.
        To launch the unit tests, call the method : self.enable_unittests().

        """
        self.add_unittest_file(os.path.join("tests", "js", "requestTest.js"))
        self.add_unittest_file(os.path.join("tests", "js", "accessibilityTest.js"))
