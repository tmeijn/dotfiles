#!/usr/bin/env bash

echo ""
echo "==============================================================="
echo ""
echo "Installing Aqua and Aqua managed tools"
echo ""
echo "==============================================================="
echo ""

wget -nv https://raw.githubusercontent.com/aquaproj/aqua-installer/v3.0.1/aqua-installer
echo "fb4b3b7d026e5aba1fc478c268e8fbd653e01404c8a8c6284fdba88ae62eda6a  aqua-installer" | sha256sum -c
chmod +x aqua-installer
./aqua-installer

rm './aqua-installer'

echo "Setting Aqua environment variables..."
export AQUA_ROOT_DIR="${XDG_DATA_HOME:-$HOME/.local/share/aquaproj-aqua}"
export PATH="${AQUA_ROOT_DIR}/bin:$PATH"
export AQUA_GLOBAL_CONFIG=${AQUA_GLOBAL_CONFIG:-${XDG_CONFIG_HOME:-$HOME/.config}/aquaproj-aqua/aqua.yaml}
export AQUA_GENERATE_WITH_DETAIL=true

echo "Installing global tools with Aqua..."
aqua install --all
