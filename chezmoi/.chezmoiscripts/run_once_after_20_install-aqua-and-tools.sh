#!/usr/bin/env bash

echo ""
echo "==============================================================="
echo ""
echo "Installing Aqua and Aqua managed tools"
echo ""
echo "==============================================================="
echo ""

wget -nv https://raw.githubusercontent.com/aquaproj/aqua-installer/v2.2.0/aqua-installer
echo "d13118c3172d90ffa6be205344b93e8621de9bf47c852d80da188ffa6985c276  aqua-installer" | sha256sum -c
chmod +x aqua-installer
./aqua-installer

rm './aqua-installer'

echo "Installing global tools with Aqua..."
aqua install --all
