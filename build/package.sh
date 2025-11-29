#!/bin/bash

# ---------------------------------------------------------------------------
# File:    package.sh
# Author:  Brigitte Bigi
# Brief:   Whakerexa packaging script.
# ---------------------------------------------------------------------------
#
# This script performs the release packaging of Whakerexa.
#
# It executes two steps:
#
#   1. Build the local JavaScript bundle (compatible with file:/// access).
#   2. Create a clean ZIP archive containing the public Whakerexa distribution.
#
# This script intentionally keeps only the minimal required logic.
# No clean option, no Sphinx, no tests, no tutorials.
#
# ---------------------------------------------------------------------------

HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

PROGRAM_DIR=$HERE
PROGRAM_NAME="Whakerexa"

VERSION_FILE="$PROGRAM_DIR/codemeta.json"
PROGRAM_VERSION=$(grep -e '"version"' "$VERSION_FILE" | awk -F':' '{print $2}' | cut -f2 -d'"')

TODAY=$(date "+%Y-%m-%d")


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
    echo -e "Whakerexa $PROGRAM_VERSION - Packaging"
    echo -e "-----------------------------------------------------------------------"
    echo
}


# ---------------------------------------------------------------------------
# Build the JS bundle
# ---------------------------------------------------------------------------

function fct_build_bundle {
    fct_echo_title "Building Whakerexa JavaScript bundle"

    python3 "$PROGRAM_DIR/build/build_bundle_js.py"
    if [ "$?" != 0 ]; then
        echo "Error: bundle creation failed."
        exit 1
    fi

    echo "Bundle created."
}


# ---------------------------------------------------------------------------
# Create ZIP package
# ---------------------------------------------------------------------------

function fct_package {
    fct_echo_title "Creating Whakerexa ZIP archive"

    PACKAGE_NAME="${PROGRAM_NAME}-${PROGRAM_VERSION}-${TODAY}.zip"

    pushd "$PROGRAM_DIR" > /dev/null

    zip -q -r "$PACKAGE_NAME" wexa_statics README.md LICENSE docs

    popd > /dev/null

    echo "The file $PACKAGE_NAME has been created."
}


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

fct_echo_header
fct_build_bundle
fct_package
fct_echo_title "Packaging completed."
