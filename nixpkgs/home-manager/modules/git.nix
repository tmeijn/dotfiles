{
  programs.git = {
    enable = true;
    userName = "Tyrone Meijn";
    userEmail = "tyrone_meijn@outlook.com";
      delta = {
        enable = true;
        options = { line-numbers = true; }; # syntax-theme = "solarized-dark";
      };
      extraConfig = {
        # diff.external = "difft";
        pull.rebase = false;
        push.default = "current";
        rebase.autosquash = true;
        init.defaultBranch = "main";
        push.autoSetupRemote = true;
        transfer.credentialsInUrl = "warn";
        gpg.format = "ssh";
        user.signingkey = "~/.ssh/id_ed25519";
      };
      aliases = {
        b = "branch";
        bt = "branch -v --sort=-committerdate";
        c = "commit";
        co = "checkout";
        d = "diff";
        dc = "diff --cached";
        l = "log";
        rsw = "restore --staged --worktree";
        s = "status";
        sw = "switch";
      };
  };
}
