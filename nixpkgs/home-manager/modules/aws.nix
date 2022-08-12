{ config, pkgs, lib, ... }:
let
  inherit (builtins) readFile;
in
{
  home.file = {
    ".aws/config".source = ./aws-config;
  };
}