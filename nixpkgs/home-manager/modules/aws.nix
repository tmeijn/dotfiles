{ config, pkgs, lib, ... }:
let
  inherit (builtins) readFile;
in
{
  home.file = {
    ".aws/config".source = ../dotfiles/aws-config;
    "${config.xdg.configHome}/lab/lab.toml".source = ../dotfiles/lab.toml;
  };
}
