{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/release-22.05";
    nixpkgsUnstable.url = "github:NixOS/nixpkgs/master";
    home-manager = {
      url = "github:nix-community/home-manager";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    flake-utils.url = "github:numtide/flake-utils";
    deploy-rs = {
      url = "github:serokell/deploy-rs";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    darwin = {
      url = "github:lnl7/nix-darwin/master";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs @ { self, flake-utils, darwin, deploy-rs, nixpkgs, nixpkgsUnstable, home-manager }:


    flake-utils.lib.eachDefaultSystem
      (system:
        let
          pkgs = import nixpkgs { inherit system; };
        in
        {

          devShell = with pkgs; pkgs.mkShell {
            buildInputs = [
              # Just in case :)
            ];
          };

        })
    // # <- concatenates Nix attribute sets
    {
      # TODO re-enable cachix across hosts

      homeConfigurations = {
        ubuntu = inputs.home-manager.lib.homeManagerConfiguration {
          pkgs = inputs.nixpkgs.legacyPackages.x86_64-linux;
          modules = [ ./nixpkgs/home-manager/ubuntu.nix ];
          extraSpecialArgs = { pkgsUnstable = inputs.nixpkgsUnstable.legacyPackages.x86_64-linux; };
        };
      };
    };

      # darwinConfigurations = {
      #   # nix build .#darwinConfigurations.mbp2021.system
      #   # ./result/sw/bin/darwin-rebuild switch --flake .
      #   mac-kabisa = darwin.lib.darwinSystem {
      #     system = "aarch64-darwin";
      #     modules = [ ./nixpkgs/darwin/mbp2021/configuration.nix ];
      #     inputs = { inherit darwin nixpkgs; };
      #   };
      # };
}