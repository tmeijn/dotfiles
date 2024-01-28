#!/usr/bin/env bash

echo ""
echo "==============================================================="
echo ""
echo "Installing tools managed by Mise"
echo ""
echo "==============================================================="
echo ""

echo "Installing Git as Mise needs that as dependency"
sudo apt install git -y

echo "Installing dependencies for building Python..."
sudo apt-get update
sudo apt-get install -y make build-essential libssl-dev zlib1g-dev \
  libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
  libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev

mise install --yes
