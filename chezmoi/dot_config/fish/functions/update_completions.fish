function update_completions
    set -l _completion_dir $fish_complete_path[1]
    if not test -d "$_completion_dir"
        echo "Fish completion directory does not exist, not updating completions"
        return
    end

    if command -v aqua >/dev/null
        aqua completion fish >"$_completion_dir/aqua.fish"
    end
    if command -v lab >/dev/null
        lab completion fish >"$_completion_dir/lab.fish"
    end
    if command -v glab >/dev/null
        glab completion -s fish >"$_completion_dir/glab.fish"
    end
    if command -v mise >/dev/null
        mise completion fish >"$_completion_dir/mise.fish"
    end
    if command -v rbw >/dev/null
        rbw gen-completions fish >"$_completion_dir/rbw.fish"
    end
    if command -v ghorg >/dev/null
        ghorg completion fish >"$_completion_dir/ghorg.fish"
    end
    if command -v starship >/dev/null
        starship completions fish >"$_completion_dir/starship.fish"
    end
    if command -v tenv >/dev/null
        tenv completion fish >"$_completion_dir/tenv.fish"
    end
    if command -v kubectl >/dev/null
        kubectl completion fish >"$_completion_dir/kubectl.fish"
    end
    if command -v git-town >/dev/null
        git-town completions fish >"$_completion_dir/git-town.fish"
    end
    if command -v fzf >/dev/null
        fzf --fish >"$_completion_dir/fzf.fish"
    end
end
