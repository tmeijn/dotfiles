# Dotfiles managed by Chezmoi and Ansible 🛠️

[toc]

Welcome to my collection of dotfiles! These configurations help personalize and streamline my development environment across various tools and applications.

**Note: Only Ubuntu 24.10 is supported, In particular Ubuntu Asahi (arm64).**

## Playbook

1. In a terminal, execute:

    ```bash
    sh -c "$(wget -qO- get.chezmoi.io) -- init --apply --exclude scripts tmeijn"
    ```

1. **Close the current terminal!**

1. Open a new terminal and execute:

    ```bash
     export ANSIBLE_PASSWORD="<YOUR_SUDO_PASSWORD>"
    ```

    ```bash
    sh -c "$(wget -qO- get.chezmoi.io) -- init --apply tmeijn"
    ```

    **note:** this might crash during installation. In that case open a new terminal and keep running `chezmoi apply`.

1. After reboot, open a terminal and unlock Bitwarden using our `reco` alias
1. Login to [`Atuin`](https://atuin.sh/):

    ```bash
    atuin login -u zero-mass92 -p $(rbw get "Atuin Sync") -k "$(rbw get "Atuin Sync" -f Key)" && atuin sync
    ```

1. Navigate to the chezmoi dir by executing `chezmoi cd`
1. Update the git remote url:

    ```bash
    git remote set-url origin git@gitlab.com:el-capitano/dotfiles.git
    ```

1. Run the script that will generate an SSH key and uploads the public key both to gitlab.com and github.com:

    ```bash
    bash gen_ssh_key_and_add_to_scms.sh
    ```

1. Run the script that will clone all repositories defined by [`ghorg reclone`](./chezmoi/dot_config/ghorg/reclone.yaml):

    ```bash
    bash clone_repositories.sh
    ```

### Configure Firefox 🦊

In a terminal, get the Firefox Account Password by running:

```bash
 rbw get "Firefox Account" | pbcopy
```

Open a **new** Firefox window and open the top-right menu to enable sync.
You will be required to login, use your email and the password you just copied to your clipboard.
After logging in, all the Add-ons will be synced to the machine.

When the Bitwarden Add-on is installed, login to your vault.

Login to following sites:

- [Google](https://accounts.google.com/)
- [Outlook Web](https://login.live.com/login.srf)
- [GitLab](https://gitlab.com/users/sign_in)
- [GitHub](https://github.com/login)
- [Reddit](https://old.reddit.com/login/)
- [Todoist](https://app.todoist.com/auth/login?success_page=%2Fapp%2Ftoday)
- [Habitica](https://habitica.com/login)
- [RoundPie](https://roundpie.app/#/login)
- [WhatsApp](https://web.whatsapp.com)

### Configure VS Code 🎹

In the left sidebar, down left, login using your GitHub account. Everything should be synced afterwards.

### Configure OneDrive sync with RClone 🔄

Configure `rclone` by creating a configuration for the  `onedrive` remote. This remote must have `onedrive` as the name to automatically mount on startup:

```shell
rclone config create onedrive onedrive
```

Then run the following command to enable the systemd user service:

```shell
systemctl --user enable --now rclone
```

## Speedrun record 🏃

I try and re-install my system about every month while measuring how long it takes to set back up again.
I measure this from the point the OS is installed, a new user with my name has been set up and Bluetooth peripherals are connected.

Current record: **20:38:32** (- ~12 minutes), set at 28-01-2024.

See [RUN_RECORDS.md](./RUN_RECORDS.md) for historical runs and more.

## Tools Used 🧰

Everything is managed by [`chezmoi`](https://www.chezmoi.io/).
The `run_once_` Bash scripts install all the tools we depend upon and actually manage the machine, namely:

- **Aqua**: [`aqua`](https://aquaproj.github.io/) is our entrypoint and actually installs a lot of single binary, zero dependency tools. See [`aqua.yaml`](chezmoi/dot_config/aquaproj-aqua/aqua.yaml) for more.
- **Mise**: [`mise`](https://mise.jdx.dev/) manages our more involved tools like Python, Node, Go, Rust, etc. See the [`config.toml`](chezmoi/dot_config/mise/config.toml) for all dependencies managed.
- **Ansible**: [Ansible](https://www.ansible.com/) manages our installed Applications using Flatpak, APT and sometimes a plain `.deb` file. See the [Ansible Playbook](ansible/setup.yaml) for more detailed information.

## References 📚

Feel free to explore and modify these dotfiles according to your preferences. Happy coding! 🚀

## Inspiration for Chezmoi dotfiles

- https://github.com/halostatue/dotfiles

## (Legacy) - References accumulated when trying out Nix

- [paholg/dotfiles: Some of my config files and scripts I find useful.](https://github.com/paholg/dotfiles)
- [GitHub - gvolpe/nix-config: NixOS configuration](https://github.com/gvolpe/nix-config)
- [breuerfelix/dotfiles: macOS + nix + home-manager + yabai + zsh + tmux + neovim](https://github.com/breuerfelix/dotfiles)
- [nix-home/home.nix at master · yrashk/nix-home](https://github.com/yrashk/nix-home/blob/master/home.nix)
- [nixos-config/default.nix at master · bobvanderlinden/nixos-config](https://github.com/bobvanderlinden/nixos-config/blob/master/home/default.nix)
- https://github.com/schickling/dotfiles
- https://sr.ht/~misterio/nix-config/
- https://github.com/Mic92/dotfiles/blob/master/flake.nix
- https://www.bekk.christmas/post/2021/16/dotfiles-with-nix-and-home-manager?utm_source=pocket_mylist
- https://gitlab.light.kow.is/dkowis/dotfiles/-/blob/master/.config/fish/config.fish
