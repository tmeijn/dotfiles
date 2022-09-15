{ config, lib, pkgs, pkgsUnstable, ... }:

{
  imports = [
    ./modules/home-manager.nix
    ./modules/bash.nix
    ./modules/starship.nix
    ./modules/aws.nix
    ./modules/git.nix
    ./modules/terminator.nix
  ];

  home.homeDirectory = "/home/tmeijn";
  home.username = "tmeijn";

  home.stateVersion = "22.05";

  # http://czyzykowski.com/posts/gnupg-nix-osx.html
  # adds file to `~/.nix-profile/Applications/pinentry-mac.app/Contents/MacOS/pinentry-mac`
  home.packages = with pkgs; [
    nodejs
    nodePackages.npm nodePackages.yarn nodePackages.fkill-cli
    gitty
    
    nixpkgs-fmt
    cowsay
    aws-vault
    bottom
    glow
    k9s
    neofetch
    awscli2
    teams
    # k8s stuff
    kubectl krew k9s kubie kind
    genact



    # https://github.com/NixOS/nixpkgs/blob/master/pkgs/data/fonts/nerdfonts/default.nix
    # nerdfonts
  ];

  # TODO
  # https://aregsar.com/blog/2020/turn-on-key-repeat-for-macos-text-editors/
  # automate `defaults write com.google.chrome ApplePressAndHoldEnabled -bool false`

  # programs.git.signing.signByDefault = true;

  nixpkgs.config.allowUnfreePredicate = pkg: builtins.elem (lib.getName pkg) [
    "1password-cli"
    "teams"
  ];
}
