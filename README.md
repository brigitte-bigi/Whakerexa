# Whakerexa - an extension for accessible contents with WhakerPy


## Overview

`WhakerPy` is an open source library to create dynamic HTML content; it's a light web application framework. `Whakerexa` offers extended capabilities including CSS and JavaScript scripts to generate an accessible HTML content with WhakerPy.


## License

Whakerexa is under the terms of the GNU General Public License version 3.


## Install Whakerexa

### From pypi.org:

```bash
> python -m pip install Whakerexa
```

### From its wheel package:

Download the wheel file (Whakerexa-xxx.whl) and install it in your python environment with:

```bash
> python -m pip install dist/<Whakerexa-xxx.whl>
```

### From its repo:

Download the repository and unpack it, or clone with `git`. Optionally, it can be installed with:

```bash
> python -m pip install .
```

Install all the optional dependencies with:

```bash
> python -m pip install ".[docs, tests]"
```



## Quick Start

Create a web application frontend with dynamic HTML content

For a quick start creating a web application frontend with dynamic HTML content, see the file `sample.py` in the repo. 
It shows a simple solution to create a server that can handle dynamic content. This content is created from a custom `ExtendedResponseRecipe()` object. The response is the interface between a local back-end python application and the web front-end.

For the use of the proposed CSS frameworks, take a look at the HTML files in the `docs` folder.


## Projects using Whakerexa

Whakerexa was initially developed within SPPAS <https://sppas.org>; it was extracted from its original software by the author to lead its own life as standalone tool. 
It is used by the SPPAS software tool for two different purposes: its website and its setup application. 
It is also used by the website of the "AutoCuedSpeech" project at <https://auto-cuedspeech.org>.



## How to contribute

If you plan to contribute to the code, please send an e-mail to the author.


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
- Added a sample

