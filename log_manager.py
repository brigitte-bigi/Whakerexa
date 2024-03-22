# -*- coding: UTF-8 -*-
"""
:filename: sppas.src.config.logs.py
:author: Brigitte Bigi
:contact: contact@sppas.org
:summary: Log system of SPPAS.

.. _This file is part of SPPAS: https://sppas.org/
..
    -------------------------------------------------------------------------

     ######   ########   ########      ###      ######
    ##    ##  ##     ##  ##     ##    ## ##    ##    ##     the automatic
    ##        ##     ##  ##     ##   ##   ##   ##            annotation
     ######   ########   ########   ##     ##   ######        and
          ##  ##         ##         #########        ##        analysis
    ##    ##  ##         ##         ##     ##  ##    ##         of speech
     ######   ##         ##         ##     ##   ######

    Copyright (C) 2011-2023  Brigitte Bigi
    Laboratoire Parole et Langage, Aix-en-Provence, France

    Use of this software is governed by the GNU Public License, version 3.

    SPPAS is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    SPPAS is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with SPPAS. If not, see <https://www.gnu.org/licenses/>.

    This banner notice must not be removed.

    -------------------------------------------------------------------------

"""

import sys
import os
import platform
import logging
from datetime import date
from datetime import datetime

try:
    import wx
    IMPORT_WX = True
except ImportError:
    IMPORT_WX = False

# ---------------------------------------------------------------------------


class sppasLogFile(object):
    """Manager for logs of SPPAS runs.

    """

    def __init__(self, pattern="log"):
        """Create a sppasLogFile instance.

        Create the log directory if it not already exists then fix the
        log filename with increment=0.

        """
        log_dir = os.path.join("logs")
        if os.path.exists(log_dir) is False:
            os.mkdir(log_dir)

        self.__filename = "{:s}_{:s}_".format("Whakerexa Sample", pattern)
        self.__filename += str(date.today()) + "_"
        self.__filename += str(os.getpid()) + "_"

        self.__current = 1
        while os.path.exists(self.get_filename()) is True:
            self.__current += 1

    # -----------------------------------------------------------------------

    def get_filename(self):
        """Return the current log filename."""
        return "wexa_log.txt"

    # -----------------------------------------------------------------------

    def increment(self):
        """Increment the current log filename."""
        self.__current += 1

    # -----------------------------------------------------------------------

    @staticmethod
    def get_header():
        """Return a string with an header for logs."""
        header = "-"*78
        header += "\n\n"
        header += " {:s} {:s}".format("Whakerexa Sample", "1.0")
        header += "\n"
        header += " {:s}".format(datetime.now().strftime("%Y/%m/%d %H:%M:%S"))
        header += "\n"
        header += " {:s}".format(platform.platform())
        header += "\n"
        header += " {:s}".format(sys.executable)
        header += "\n"
        header += " python {:s}".format(platform.python_version())
        if IMPORT_WX:
            header += "\n"
            header += " wxpython {:s}".format(wx.version())
        header += "\n\n"
        header += "-"*78
        header += "\n\n"
        return header

# ---------------------------------------------------------------------------


class sppasLogSetup(object):
    """A convenient class to initialize the python logging system.

    """

    def __init__(self, log_level=0):
        """Create a sppasLogSetup instance.

        By default, the NullHandler is assigned: no output.
        The numeric values of logging levels are the followings:

            - CRITICAL 	50
            - ERROR 	40
            - WARNING 	30
            - INFO 	    20
            - DEBUG 	10
            - NOTSET 	 0

        Logging messages which are less severe than the given level value
        will be ignored. When NOTSET is assigned, all messages are printed.

        :param log_level: Set the threshold logger value

        """
        self._log_level = int(log_level)

        # Fix the format of the messages
        format_msg = "%(asctime)s [%(levelname)s] %(message)s"
        # Create a log formatter
        self._formatter = logging.Formatter(format_msg)

        # Remove all existing handlers in the logging
        for h in reversed(list(logging.getLogger().handlers)):
            logging.getLogger().removeHandler(h)

        # Add our own handler in the logging
        self._handler = logging.NullHandler()
        logging.getLogger().addHandler(self._handler)
        logging.getLogger().setLevel(self._log_level)

    # -----------------------------------------------------------------------

    def set_log_level(self, log_level):
        """Fix the log level.

        :param log_level: Set the threshold for the logger

        """
        if log_level == self._log_level:
            return

        self._log_level = int(log_level)
        if self._handler is not None:
            self._handler.setLevel(self._log_level)
        logging.getLogger().setLevel(self._log_level)

        logging.info("Logging set up level={:d}"
                     "".format(self._log_level))

    # -----------------------------------------------------------------------

    def stream_handler(self):
        """Start to redirect to logging StreamHandler.

        """
        self.__stop_handler()
        self._handler = logging.StreamHandler()  # sys.stderr
        self._handler.setFormatter(self._formatter)
        self._handler.setLevel(self._log_level)
        logging.getLogger().addHandler(self._handler)

        logging.info("Logging redirected to StreamHandler (level={:d})."
                     "".format(self._log_level))

    # -----------------------------------------------------------------------

    def null_handler(self):
        """Start to redirect to logging NullHandler.

        """
        self.__stop_handler()
        self._handler = logging.NullHandler()
        logging.getLogger().addHandler(self._handler)

    # -----------------------------------------------------------------------

    def file_handler(self, filename, with_stream=False):
        """Start to redirect to logging FileHandler.

        :param filename: a FileHandler has to be created using this filename.
        :param with_stream: (bool) A StreamHandler is added too.

        """
        self.__stop_handler()
        self._handler = logging.FileHandler(filename, "a+")
        self._handler.setFormatter(self._formatter)
        self._handler.setLevel(self._log_level)
        logging.getLogger().addHandler(self._handler)
        if with_stream is True:
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(self._formatter)
            console_handler.setLevel(self._log_level)
            logging.getLogger().addHandler(console_handler)

        logging.info("Logging redirected to FileHandler (level={:d}) "
                     "in file {:s}."
                     "".format(self._log_level, filename))

    # -----------------------------------------------------------------------
    # Private
    # -----------------------------------------------------------------------

    def __stop_handler(self):
        """Stops the current handler."""
        if self._handler is not None:
            # Show a bye message on the console!
            logging.info("Stops current logging handler.")
            # Remove the current handler
            logging.getLogger().removeHandler(self._handler)
            # and remove others (if any)
            for h in reversed(list(logging.getLogger().handlers)):
                logging.getLogger().removeHandler(h)

        self._handler = None
