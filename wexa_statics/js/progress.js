/**
:filename: statics.js.progress.js
:author: Florian Lopitaux
:contact: contact@sppas.org
:summary: File that contains the function to update the html progress bar.

.. _This file is part of Whakerexa: https://sourceforge.net/projects/whakerexa/ ,
.. on 2024-03-01.
    -------------------------------------------------------------------------

    Copyright (C) 2011-2024  Brigitte Bigi
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

*/

function update_bar(percent, text = "", header = "") {
    let p = document.getElementById("progress_text");
    if (p != null) {
        p.innerHTML = text;
    }

    let h3 = document.getElementById("progress_header");
    if (h3 != null) {
        h3.innerHTML = header;
    }

    let progress = document.getElementById("percent");
    progress.setAttribute("value", percent);
}
