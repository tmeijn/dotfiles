{ config, pkgs, lib, pkgsUnstable, ... }:

{
  # Starship Prompt
  # https://rycee.gitlab.io/home-manager/options.html#opt-programs.starship.enable
  programs.starship.enable = true;
  programs.starship.enableBashIntegration = true;
  # programs.starship.enableFishIntegration = true;

  programs.starship.package = pkgsUnstable.starship;

  programs.starship.settings = {
    # See docs here: https://starship.rs/config/
    # Symbols config configured ./starship-symbols.nix.
    format =
      ''
        $fill
        $all$fill
        $character
      '';
    add_newline = true;

    fill = {
      symbol = "-";
      style = "#33658A";
    };

    shlvl = {
      disabled = false;
      style = "inverted bold bright-purple";
      threshold = 2;
    };

    git_commit = {
      only_detached = false;
      tag_disabled = false;
    };
    git_metrics.disabled = false;

    directory = {
      truncate_to_repo = false;
      truncation_symbol = "…/";
      truncation_length = 8;
    };

    terraform.format = "via [Terraform $version]($style) ";
    kubernetes.disabled = false;
  };
}
