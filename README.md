# Whakerexa - A minimalist and lightweight web kit for accessible contents


## Overview

`Whakerexa` offers CSS frameworks and JavaScript to generate an HTML content.
It is intended to be as simple as possible to make **accessible web content**, and to minimize the use of CSS classes for enhancing the readability of HTML code.

It was designed to be easily customizable, allowing users to adjust properties such as fonts, colors, borders, etc., effortlessly. Most of the properties are stored into variables which makes possible to re-define them, then to obtain a custom different style, enabling users to achieve a unique style easily.

It can be combined with the use of `WhakerPy`, an open source library to create dynamic HTML content; it's a light web application framework.

### Features

- Lightweight and semantic
- Light or dark mode
- Normal or high-Contrast mode
- Easy use and customization
- Human-readable: could be extended or composed for your specific needs
- No extra library or framework needed



## License

Whakerexa is under the terms of the GNU General Public License, version 3.


## Install Whakerexa

Whakerexa is a ZIP archive. You just need to unpack-it.



## Quick Start

For the use of the proposed CSS/JS frameworks, take a look at the HTML files in the `docs` folder.


## Projects using Whakerexa

Whakerexa was initially developed within SPPAS <https://sppas.org>. It was extracted from its original software in 2024 by the author to lead its own life as standalone tool.


### Websites

It is used by the website of the "AutoCuedSpeech" project at <https://auto-cuedspeech.org> and the website of SPPAS <https://sppas.org>.


### Applications

It is used by the setup application of SPPAS software tool.


### Documentations

It is used by "ClammingPy", a tool to create automatically python documentation <https://clamming.sf.net>.



## Author/Copyright

Copyright (C) 2023-2024 - Brigitte Bigi - <contact@sppas.org>
Laboratoire Parole et Langage, Aix-en-Provence, France.

See the AUTHORS file for the full list of contributors.


## Support

Whakerexa was initially developed within <https://auto-cuedspeech.org> project, generously funded by FIRAH (Fondation Internationale de Recherche Appliquée sur le Handicap), <https://www.firah.org/>.


# Changes

## Version 0.1

- Initial version, extracted from SPPAS 4.17.
- Added or updated, and tested JavaScripts 
- Updated CSS frameworks to be more generic
- Added HTML documentation of the CSS frameworks
- Added a CSS/JS framework for playing a video in a popup dialog

## Version 0.2 - latest stable

- Added code.css, a set of colors for highlighting source code.
- Added menu.css, a solution for an accessible responsive sticky menubar
- Added layout.css, a set of classes to easily organize HTML content
- Added accordion.js which must be added when using "rise-panel"

## Version 0.3 - develop

- Changed some colors of code.css
- Added variable 'border-radius' in wexa.css
- Modified details/summary to act and look like buttons
- The "rise-panel/accordion" is deprecated (HTML-3), use HTML-5 details/summary instead
- Added modal dialogs to show an alert message: info, success, warning, error, tips, question (under-construction)

## to do:

- documentation of layouts
- in layout: horizontal cards
