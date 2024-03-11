# Whakerexa - an extension for accessible contents with WhakerPy


## Overview

WhakerPy is an open source library to create dynamic HTML content; it's a light web application framework. Whakerexa offers extended capabilities including CSS and JavaScript scripts to generate an accessible HTML content with WhakerPy.


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
> python -m pip install ".[doc, dev, test]"
```



## Quick Start

Open a Python interpreter and type or paste the following:

```python
>>> from whakerpy.htmlmaker import HTMLTree
>>> from whakerpy.htmlmaker import HTMLNode
>>> htree = HTMLTree("index")
>>> node = HTMLNode(htree.body_main.identifier, None, "h1", value="this is a title")
>>> htree.body_main.append_child(node)
```

Render and print the HTML:
```python
>>> print(htree.serialize())
```

```html
<!DOCTYPE html>

<html>
   <head>    </head>
<body>
 <main>
     <h1>
         this is a title
     </h1>
 </main>

</body>
</html>
```

Let's view the result in your favorite web browser:

```python
>>> import webbrowser
>>> file_wexa = htree.serialize_to_file('file.html')
>>> webbrowser.open_new_tab(file_wexa)
```

## Create a web application frontend with dynamic HTML content

For a quick start, see the file `sample.py` in the repo. It shows a very simple solution to create a server that can handle dynamic content. This content is created from a custom `ExtendedResponseRecipe()` object. The response is the interface between a local back-end python application and the web front-end.


## Projects using Whakerexa

Whakerexa was initially developed within SPPAS <https://sppas.org>; it was extracted from its original software by the author to lead its own life as standalone package. 



# The developer's corner

## Create a wheel

Whakerexa is no system dependent. Information to build its wheel are stored into the file `pyproject.toml`. 

The universal wheel is created with: `python -m build`


## Make the doc

The API documentation is available in the `doc` folder. Click the file `index.html` to browse throw the documented classes.

To re-generate the doc, install the required external program, then launch the doc generator:
```bash
>python -m pip install ".[doc]"
>python makedoc.py
```


## How to contribute

If you plan to contribute to the code, please send an e-mail to the author.


## Author/Copyright

Copyright (C) 2023-2024 - Brigitte Bigi - <contact@sppas.org>
Laboratoire Parole et Langage, Aix-en-Provence, France.

See the AUTHORS file for the full list of contributors.


## Support

Whakerexa was developped thanks to the support of <https://auto-cuedspeech.org> project.


# Changes

## Version 0.1

- Initial version, extracted from SPPAS 4.17.
- Added JS


