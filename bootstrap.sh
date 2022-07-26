#!/usr/bin/env bash

# Install nix
curl -L https://nixos.org/nix/install | sh

mkdir -p ~/.config/nix

cat <<EOF > ~/.config/nix/nix.conf
experimental-features = nix-command flakes
EOF
