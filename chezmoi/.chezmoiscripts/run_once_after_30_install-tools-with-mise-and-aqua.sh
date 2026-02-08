#!/usr/bin/env -S bash

echo ""
echo "==============================================================="
echo ""
echo "Installing tools managed by Mise & Aqua"
echo ""
echo "==============================================================="
echo ""

echo "Installing rbw..."
mise use github:doy/rbw

echo "Initializing mise..."
eval "$(mise env -s bash)"

echo "Logging into Bitwarden..."
rbw login

echo "Setting GitHub token fetched from Bitwarden..."
GITHUB_TOKEN="$(rbw get GITHUB_TOKEN)"
export GITHUB_TOKEN

echo "Installing global tools with Aqua..."
aqua install --all

echo "Installing global tools managed with Mise..."
mise install --yes
