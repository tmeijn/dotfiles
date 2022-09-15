{ config, pkgs, lib, ... }:
let
  inherit (builtins) readFile;
in
{
  programs.bash = {
    enable = true;
    bashrcExtra = ''
      . ~/oldbashrc
    '';

    initExtra =
      lib.concatStringsSep "\n" [
        (readFile ../dotfiles/bash_functions)
      ];
  };

  programs.fish = {
    enable = true;
  };
}
