# -*- coding: UTF-8 -*-
"""
:filename: main_sample.py
:author:   Florian LOPITAUX
:contact:  contact@sppas.org
:summary:  Server runner of the sample webapp.

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

import logging
import webbrowser

from whakerpy.httpd import BaseHTTPDServer
from whakerpy.webapp import WebSiteApplication

from samples.sample import SampleAppResponse

# -----------------------------------------------------------------------


class AppServer(BaseHTTPDServer):
    """A custom HTTPD server for `sample` web front-end.

    """
    def create_pages(self, app: str = "app"):
        """Override. Add bakeries for dynamic HTML pages of this app.

        :param app: (str) Un-used parameter.

        """
        logging.debug("HTTPD server initialization...")

        app_bakery = SampleAppResponse()
        self._pages[app_bakery.page()] = app_bakery
        self._default = app_bakery.page()

# -----------------------------------------------------------------------


if __name__ == "__main__":
    app = WebSiteApplication(AppServer)
    url = app.client_url()
    webbrowser.open_new_tab(url)
    logging.info(url)
    app.run()
