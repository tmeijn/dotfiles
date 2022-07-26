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
        (readFile ./bashrc)
      ];
  };

}
