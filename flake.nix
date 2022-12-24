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

    tfenv.url = "github:tfutils/tfenv";
    tfenv.flake = false;
  };

  outputs = inputs @ { self, flake-utils, darwin, deploy-rs, nixpkgs, nixpkgsUnstable, home-manager, tfenv }:
    with inputs;
    {
      # TODO re-enable cachix across hosts

      # Expose overlay to flake outputs, to allow using it from other flakes.
      # Flake inputs are passed to the overlay so that the packages defined in
      # it can use the sources pinned in flake.lock
      overlays.default = final: prev: (import ./overlays inputs) final prev;

      homeConfigurations = {
        ubuntu = inputs.home-manager.lib.homeManagerConfiguration {
          pkgs = nixpkgs.legacyPackages.x86_64-linux.extend self.overlays.default;
          modules = [ ./nixpkgs/home-manager/ubuntu.nix ];
          extraSpecialArgs = { pkgsUnstable = inputs.nixpkgsUnstable.legacyPackages.x86_64-linux; };
        };

        ubuntu-mac = inputs.home-manager.lib.homeManagerConfiguration {
          pkgs = nixpkgs.legacyPackages.x86_64-linux.extend self.overlays.default;
          modules = [ ./nixpkgs/home-manager/ubuntu.nix ];
          extraSpecialArgs = { pkgsUnstable = inputs.nixpkgsUnstable.legacyPackages.aarch64-linux; };
        };
      };
    } //

    # All packages in the ./packages subfolder are also added to the flake.
    # flake-utils is used for this part to make each package available for each
    # system. This works as all packages are compatible with all architectures
    (flake-utils.lib.eachSystem [ "aarch64-linux" "i686-linux" "x86_64-linux" ])
      (system:
        let pkgs = nixpkgs.legacyPackages.${system}.extend self.overlays.default;
        in
        rec {
          # Custom packages added via the overlay are selectively exposed here, to
          # allow using them from other flakes that import this one.
          packages = flake-utils.lib.flattenTree {
            # wezterm-bin = pkgs.wezterm-bin;
            # wezterm-nightly = pkgs.wezterm-nightly;
            # hello-custom = pkgs.hello-custom;
            # filebrowser = pkgs.filebrowser;
            # darktile = pkgs.darktile;
            # dirserver = pkgs.dirserver;
            # fritzbox_exporter = pkgs.fritzbox_exporter;
            # mqtt2prometheus = pkgs.mqtt2prometheus;
            # xscreensaver = pkgs.xscreensaver;
            # smartmon-script = pkgs.smartmon-script;
            tfenv = pkgs.tfenv;
          };
        });

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
