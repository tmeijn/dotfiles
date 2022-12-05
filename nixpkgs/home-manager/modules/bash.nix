{ config, pkgs, lib, ... }:
let
  inherit (builtins) readFile;
in
{
  programs.bash = {
    enable = true;
    # bashrcExtra = ''
    #   . ~/oldbashrc
    # '';

    initExtra =
      lib.concatStringsSep "\n" [
        (readFile ../dotfiles/bash_functions)
      ];

    shellAliases = {
      # Shortcuts for ls
      ll = "ls -alF";
      la = "ls -A";
      l = "ls -CF";

      # Handy Terraform shortcuts
      tfplan = "terraform plan -out=plan.tfplan";
      tfapply = "terraform apply plan.tfplan";
      tfinit = "terraform init";
      tfcopyplan = "terraform show -no-color plan.tfplan | pbcopy";

      # kubectl -> k + auto complete
      k = "kubectl";

      pls = "sudo $(fc - ln - 1)";
    };
  };

  programs.fish = {
    enable = true;
  };
}

