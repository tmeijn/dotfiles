{ config, lib, pkgs, ... }:

{
  imports = [
    ./modules/home-manager.nix
    ./modules/bash.nix
    ./modules/starship.nix
  #   ./modules/common.nix
  #   ./modules/git.nix
  #   ./modules/neovim.nix
  ];

  home.homeDirectory = "/home/tmeijn";
  home.username = "tmeijn";

  home.stateVersion = "20.09";

  # http://czyzykowski.com/posts/gnupg-nix-osx.html
  # adds file to `~/.nix-profile/Applications/pinentry-mac.app/Contents/MacOS/pinentry-mac`
  home.packages = with pkgs; [
    nodejs
    nixpkgs-fmt
    aws-vault
    bottom



    # https://github.com/NixOS/nixpkgs/blob/master/pkgs/data/fonts/nerdfonts/default.nix
    # nerdfonts
  ];

  # TODO
  # https://aregsar.com/blog/2020/turn-on-key-repeat-for-macos-text-editors/
  # automate `defaults write com.google.chrome ApplePressAndHoldEnabled -bool false`

  # programs.git.signing.signByDefault = true;

  nixpkgs.config.allowUnfreePredicate = pkg: builtins.elem (lib.getName pkg) [
    "1password-cli"
  ];
}