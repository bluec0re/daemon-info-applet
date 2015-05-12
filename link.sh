#!/bin/bash

DIR=$(realpath "$(dirname "$0")")

echo "Linking $DIR into cinnamon applets"
ln -s "$DIR" ~/.local/share/cinnamon/applets/daemon-info@bluec0re.eu
