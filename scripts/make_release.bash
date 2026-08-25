#!/bin/bash

# ---------------------------------------------------------------------------
# File:    make_release.bash
# Author:  Brigitte Bigi
# Brief:   Whakerexa release build script.
# ---------------------------------------------------------------------------
#
# This script builds what a release ships but no source holds:
#
#   1. The local JavaScript bundle, for pages read through file:///.
#   2. The minified stylesheets, for pages served over a network.
#
# Both are engendered from the sources, and neither is written by hand. It is
# launched from anywhere: the paths are taken from the location of the script.
#
# ---------------------------------------------------------------------------

HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

PROGRAM_DIR=$HERE
ROOT_DIR="$PROGRAM_DIR/.."

VERSION_FILE="$ROOT_DIR/codemeta.json"
PROGRAM_VERSION=$(grep -e '"version"' "$VERSION_FILE" | awk -F':' '{print $2}' | cut -f2 -d'"')


# ---------------------------------------------------------------------------
# Echo helpers
# ---------------------------------------------------------------------------

function fct_echo_title {
    echo -e "-----------------------------------------------------------------------"
    echo -e "$1"
    echo -e "-----------------------------------------------------------------------"
}

function fct_echo_header {
    echo
    echo -e "-----------------------------------------------------------------------"
    echo -e "Whakerexa $PROGRAM_VERSION - Release build"
    echo -e "-----------------------------------------------------------------------"
    echo
}


# ---------------------------------------------------------------------------
# Build the JS bundle
# ---------------------------------------------------------------------------

function fct_build_bundle {
    fct_echo_title "Building Whakerexa JavaScript bundle"

    python3 "$PROGRAM_DIR/build_bundle_js.py"
    if [ "$?" != 0 ]; then
        echo "Error: bundle creation failed."
        exit 1
    fi

    echo "Bundle created."
}


# ---------------------------------------------------------------------------
# Build the minified stylesheets
# ---------------------------------------------------------------------------

function fct_build_css_min {
    fct_echo_title "Minifying Whakerexa stylesheets"

    python3 "$PROGRAM_DIR/build_css_min.py"
    if [ "$?" != 0 ]; then
        echo "Error: stylesheet minification failed."
        exit 1
    fi

    echo "Stylesheets minified."
}


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

pushd "$ROOT_DIR" > /dev/null

fct_echo_header
fct_build_bundle
fct_build_css_min

popd > /dev/null

fct_echo_title "Release build completed."
