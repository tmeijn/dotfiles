#!/usr/bin/env bash

echo ""
echo "==============================================================="
echo ""
echo "Gathering extension list and updating..."
echo ""
echo "==============================================================="
echo ""

if ! type gnome-extensions-cli; then
  echo "Extensions cli not available, exiting"
  exit 1
fi

# Removing Pop Shell as that is installed via Ansible and not available on Gnome Extensions website.
gnome-extensions-cli ls --only-uuid | grep -v 'pop-shell@system76.com' | tee chezmoi/installed-extensions.txt

echo "Updating dconf.ini."
dconf dump / > chezmoi/dconf.ini
