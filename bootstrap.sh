#!/usr/bin/env bash

# Install nix
if ! command -v nix &> /dev/null; then
  echo "Nix not found, installing..."
  sh <(curl -L https://nixos.org/nix/install) --darwin-use-unencrypted-nix-store-volume --daemon
fi

nix --version

mkdir -p ~/.config/nix

cat <<EOF > ~/.config/nix/nix.conf
experimental-features = nix-command flakes
EOF

# Install nix
if ! command -v home-manager &> /dev/null; then
  echo "Nix Home Manager (HM) not found, Setting up..."

  echo "Adding 22.05 HM channel..."
  nix-channel --add https://github.com/nix-community/home-manager/archive/release-22.05.tar.gz home-manager
  nix-channel --update

  echo "Installing Home Manager..."
  export NIX_PATH=$HOME/.nix-defexpr/channels:/nix/var/nix/profiles/per-user/root/channels${NIX_PATH:+:$NIX_PATH}
  nix-shell '<home-manager>' -A install
fi

echo "Home Manager: $(home-manager --version)"

echo "Loading session vars..."
. "$HOME/.nix-profile/etc/profile.d/hm-session-vars.sh"


read -p "Which home configuration would you like to activate? " flake

home-manager switch -b backup --flake .#${flake}

if [$1 -eq 1 ]; then
  echo "Something went wrong, trying with backup mode..."
  home-manager switch -b backup --flake .#${flake}
fi


