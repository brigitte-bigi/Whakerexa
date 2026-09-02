#!/bin/bash

# ---------------------------------------------------------------------------
# File:    make_release.bash
# Author:  Brigitte Bigi
# Brief:   Whakerexa release build script.
# ---------------------------------------------------------------------------
#
# This script builds a release of Whakerexa:
#
#   1. The local JavaScript bundle, for pages read through file:///.
#   2. The minified stylesheets, for pages served over a network.
#   3. The ZIP archive of the distribution, written in build/.
#
# The first two are engendered from the sources, and neither is written by
# hand. It is launched from anywhere: the paths are taken from the location of
# the script.
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
# Check that every theme holds its contract
# ---------------------------------------------------------------------------

function fct_check_themes {
    fct_echo_title "Checking the contract of the themes"

    python3 "$PROGRAM_DIR/check_themes.py"
    if [ "$?" != 0 ]; then
        echo "Error: a theme leaves a group of variables incomplete."
        exit 1
    fi

    echo "The contract is held."
}


# ---------------------------------------------------------------------------
# Write what the reference set of icons carries
# ---------------------------------------------------------------------------

function fct_build_icons_reference {
    fct_echo_title "Writing what the reference set of icons carries"

    python3 "$PROGRAM_DIR/build_icons_reference.py"
    if [ "$?" != 0 ]; then
        echo "Error: the reference set was not written."
        exit 1
    fi

    echo "Reference set written."
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
# Create ZIP package
# ---------------------------------------------------------------------------

function fct_package {
    fct_echo_title "Creating Whakerexa ZIP archive"

    PROGRAM_NAME="Whakerexa"
    PACKAGE_NAME="${PROGRAM_NAME}-${PROGRAM_VERSION}.zip"
    STAGE_NAME="${PROGRAM_NAME}-${PROGRAM_VERSION}"
    STAGE_DIR="$ROOT_DIR/$STAGE_NAME"
    BUILD_DIR="$ROOT_DIR/build"

    mkdir -p "$BUILD_DIR"
    rm -rf "$STAGE_DIR"
    mkdir -p "$STAGE_DIR"
    cp -r "$ROOT_DIR/wexa_statics" "$ROOT_DIR/docs" "$ROOT_DIR/index.html" \
          "$ROOT_DIR/README.md" "$ROOT_DIR/AUTHORS" "$ROOT_DIR/LICENSE" "$STAGE_DIR/"

    rm -f "$BUILD_DIR/$PACKAGE_NAME"
    zip -q -r "build/$PACKAGE_NAME" "$STAGE_NAME"

    rm -rf "$STAGE_DIR"

    echo "The file build/$PACKAGE_NAME has been created."
}


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

pushd "$ROOT_DIR" > /dev/null

fct_echo_header
fct_check_themes
fct_build_icons_reference
fct_build_bundle
fct_build_css_min
fct_package

popd > /dev/null

fct_echo_title "Release build completed."
