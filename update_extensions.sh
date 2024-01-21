#!/usr/bin/env bash

echo "Removing Gnome Shell Extensions directory from Chezmoi."
chezmoi forget ~/.local/share/gnome-shell/extensions

echo "Adding the Extensions directory back in."
chezmoi add ~/.local/share/gnome-shell/extensions

echo "Updating dconf.ini."
dconf dump / > dconf.ini
