### Git Town

This could be used to replace our custom commands.
already aliased to `gt` with autocomplete.

Not sure about our `g_commit_and_push` func yet.

### git-filter-repo

A python package to rewrite git history.

### trash-cli

Might be interesting:

https://github.com/devops-works/binenv/blob/6d907ddcc0e52557343b2965690da4efbaeacec2/DISTRIBUTIONS.md


needed for python (sigh...): `sudo apt-get install build-essential libssl-dev libffi-dev python-dev`


TODO: detect system to determine if we need to build `rbw` using cargo. Only x64 linux is supported as released binary via aqua.
TODO: check whether http deb packages are installed before executing.
TODO: check if we can reduce python dependencies
TODO: add error handling for ansible not installed
TODO: ensure scripts are idempotent
TODO: Split aqua config into logical yamls
TODO: see if we can manage gnome extensions some way

consider implementing this: https://github.com/bitwarden/cli/issues/65#issuecomment-683385208

### Quick notes on Ubuntu Asahi install

After installation:

1. Connect to the internet
2. Create a new user with `sudo adduser <USERNAME>` and follow the prompts. This will be the main user
3. Add this user to sudo with `sudo usermod -aG sudo <USERNAME>`
4. Run `sudo apt update`
5. Run `sudo apt upgrade`
6. Reboot system
7. Log in as the newly created user
8. Install Timeshift with `sudo apt install timeshift`
9. Follow the prompts, making sure that the snapshots include the home directory of the newly created user
10. System should now be ready for Chezmoi...

