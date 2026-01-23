function update_completions
    set -l _completion_dir $fish_complete_path[1]
    if not test -d "$_completion_dir"
        echo "Fish completion directory does not exist, not updating completions"
        return
    end

    if type -q aqua
        aqua completion fish >"$_completion_dir/aqua.fish"
    end
    if type -q glab
        glab completion -s fish >"$_completion_dir/glab.fish"
    end
    if type -q mise
        mise completion fish >"$_completion_dir/mise.fish"
    end
    if type -q rbw
        rbw gen-completions fish >"$_completion_dir/rbw.fish"
    end
    if type -q ghorg
        ghorg completion fish >"$_completion_dir/ghorg.fish"
    end
    if type -q starship
        starship completions fish >"$_completion_dir/starship.fish"
    end
    if type -q tenv
        tenv completion fish >"$_completion_dir/tenv.fish"
    end
    if type -q kubectl
        kubectl completion fish >"$_completion_dir/kubectl.fish"
    end
    if type -q git-town
        git-town completions fish >"$_completion_dir/git-town.fish"
    end
    if type -q fzf
        fzf --fish >"$_completion_dir/fzf.fish"
    end
    if type -q chezmoi
        chezmoi completion fish >"$_completion_dir/chezmoi.fish"
    end
    if type -q grafanactl
        grafanactl completion fish >"$_completion_dir/grafanactl.fish"
    end
    if type -q uv
        uv generate-shell-completion fish >"$_completion_dir/uv.fish"
    end
    if type -q lla
        lla completion fish >"$_completion_dir/lla.fish"
    end
    if type -q alloy
        alloy completion fish >"$_completion_dir/alloy.fish"
    end
end
