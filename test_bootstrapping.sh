#!/usr/bin/env -S bash -i

_branch="{$1:-main}"

if ! command -v incus &> /dev/null; then
  echo "This script relies on Incus being installed! Exiting"
  exit 1
fi

incus exec chezmoi-tester --

sh -c "$(wget -qO- get.chezmoi.io)" -- init --branch "feat/support-ubuntu-arm64" --verbose --apply https://gitlab.com/tmeijn/dotfiles.git
