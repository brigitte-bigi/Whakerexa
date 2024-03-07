# -*- coding: UTF-8 -*-
"""
:filename: whakerexa.custom_nodes.video_player.py
:author:   Florian LOPITAUX
:contact:  contact@sppas.org
:summary:  Class to create a custom video player with an image pre-visualization and video opened in a pop-up.

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

from whakerexa.whakerpy.htmlmaker import HTMLNode

# ---------------------------------------------------------------------------

IMAGE_EXTENSIONS = [".jpeg", ".jpg", ".png", ".PNG", "webp"]

JS_SCRIPT = """
function play_popup_video(id-popup) {
    let modal = document.getElementById("popup-" + id-popup);
    let video = document.getElementById("popup-video-" + id-popup);

    // quick start of the video to the client get the video file
    video.play();
    video.pause();

    modal.showModal();
}

function close_popup_video(id-popup) {
    let modal = document.getElementById("popup-" + id-popup);
    let video = document.getElementById("popup-video-" + id-popup);

    video.pause();
    modal.close();
}

"""


# ---------------------------------------------------------------------------


class VideoPlayer(HTMLNode):

    def __init__(self, parent_id: str, body_script: HTMLNode, video_path: str, identifier: str, img_path: str = ""):
        super(VideoPlayer, self).__init__(parent_id, identifier, "img")
        self.set_attribute("class", "img-video-visualization")
        body_script.set_value(JS_SCRIPT)

        if not os.path.exists(video_path):
            raise FileNotFoundError(f"The video : {video_path} doesn't exists !")

        self.__video_path = video_path
        if img_path == "":
            self.__img_path = ""
            if not self.__find_image_preload():
                logging.warning("No given image path and the default image path doesn't exist")
        else:
            self.__img_path = img_path

        self.set_attribute("src", self.__img_path)
        self.__create_elements()

    # -----------------------------------------------------------------------
    # SETTERS
    # -----------------------------------------------------------------------

    def set_img_path(self, img_path: str) -> None:
        """Set the image path of the video pre-visualization.
        If the image doesn't found raise a 'FileNotFoundError'.

        :param img_path: (str) The path of the video

        :raises FileNotFoundError: if the image on the given path doesn't exist

        """
        if os.path.exists(img_path):
            self.__img_path = img_path
            self.set_attribute("src", self.__img_path)
        else:
            raise FileNotFoundError(f"The image pre-visualization : {img_path} doesn't exists !")

    # -----------------------------------------------------------------------

    def set_alt_description(self, description: str) -> None:
        """Set the alternative text description image pre-visualization.
        The text appear when the image can't display or if the user actives the narrator.

        :param description: (str) The alternative text description image

        """
        self.set_attribute("alt", description)

    # -----------------------------------------------------------------------
    # PRIVATE METHODS
    # -----------------------------------------------------------------------

    def __create_elements(self) -> None:
        """Create every html elements for the video : the play button and the popup with the video.

        """
        # create play button
        play_button = HTMLNode(self.identifier, "play_button", "button", attributes={"class": "play-btn"})
        play_button.set_attribute("onclick", f"play_popup_video('{self.identifier}')")

        play_img = HTMLNode(play_button.identifier, None, "img", attributes={"class": "play-img"})
        play_img.set_attribute("src", os.path.join("statics", "img", "play_button.png"))
        play_img.set_attribute("alt", "Play button to launch a video")

        play_button.append_child(play_img)
        self.append_child(play_button)

        # create popup widget
        id_modal = f"popup-{self.identifier}"
        modal = HTMLNode(self.identifier, id_modal, "dialog", attributes={
            "id": id_modal,
            "class": "popup-video"
        })

        close_button = HTMLNode(id_modal, None, "button", value="&#10060;", attributes={
            "class": "popup-close-btn",
            "onclick": f"close_popup_video('{self.identifier}')"
        })

        id_video = f"video-{id_modal}"
        video = HTMLNode(id_modal, id_video, "video", attributes={
            "id": id_video,
            "controls": "true",
            "preload": "none"
        })

        _, file_extension = os.path.splitext(self.__video_path)
        source = HTMLNode(id_video, None, "source", attributes={
            "src": self.__video_path,
            "type": f"video/{file_extension}"
        })

        video.append_child(source)
        modal.append_child(video)
        modal.append_child(close_button)
        self.append_child(modal)

    # -----------------------------------------------------------------------

    def __find_image_preload(self) -> bool:
        """Search the default image pre-visualization for the video.

        For example, if the video has this path : 'assets/video_example.mp4', then we attempt to find an image with
        this following path : 'assets/video_example.jpg' (or other image formats).

        The image extension must be in this list : .jpeg, .jpg, .png, .PNG, .webp

        """
        path, _ = os.path.splitext(self.__video_path)

        for extension in IMAGE_EXTENSIONS:
            final_path = path + extension

            if os.path.exists(final_path):
                self.__img_path = final_path
                return True

        return False
