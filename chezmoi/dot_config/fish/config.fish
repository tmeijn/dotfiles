# Some nice resources
# - https://www.reddit.com/r/fishshell/comments/1he9bd8/what_are_you_abbreviations/
# - https://www.reddit.com/r/fishshell/comments/1gp750x/can_i_see_your_fish_configs/

set -x TF_CLI_ARGS_plan "-lock=false"
set -x TF_HTTP_USERNAME tmeijn

fish_add_path $HOME/.krew/bin $HOME/.cargo/bin $HOME/.local/bin $HOME/bin

# Everything below this should only be loaded on interactive shells.
if ! status is-interactive
    mise activate fish --shims | source
    return 0
end

if command -v mise &>/dev/null
    mise activate fish | source
    mise hook-env -s fish | source
    # Mise itself doesn't export this as a variable as Aqua does do, so we do it ourself.
    set -gx MISE_GLOBAL_CONFIG (mise config ls --no-header | head -n1 | awk '{print $1}')
    set -gx MISE_GLOBAL_CONFIG (string replace -a '~' $HOME $MISE_GLOBAL_CONFIG)
end

if command -v git-town &> /dev/null
    alias gt='git-town'
end

if command -v kubectl &>/dev/null
    function kubectl --wraps kubectl
        command kubecolor $argv
    end

    # adds alias for "k" to "kubecolor" with completions
    function k --wraps kubectl
        command kubecolor $argv
    end

    # Set `dyff` as the kubectl differ (k diff ...)
    set -x KUBECTL_EXTERNAL_DIFF "dyff between --omit-header --set-exit-code"
end

if command -v aws_completer &>/dev/null
    # Enable AWS CLI autocompletion: https://github.com/aws/aws-cli/issues/1079#issuecomment-541997810
    complete --command aws --no-files --arguments '(begin; set --local --export COMP_SHELL fish; set --local --export COMP_LINE (commandline); aws_completer | sed \'s/ $//\'; end)'
end

# Only update completions once a day since this is a slow operation.
if test ! -e $HOME/.update_completions_lock || test (math (date +%s) - (stat -c %Y $HOME/.update_completions_lock)) -gt 86400
    update_completions
    echo "Updating completions..."
    touch $HOME/.update_completions_lock
end

# Can be used as fallback when rbw is broken.
if test -f ~/.env
    set -gx (cat ~/.env | string split -f1 '=')
end

# ENHANCE!
command -v fixit >/dev/null; and fixit init fish | source
command -v zoxide >/dev/null; and zoxide init --cmd cd fish | source
command -v atuin >/dev/null; and atuin init fish | source
#command -v savvy >/dev/null; and savvy init fish | source # Disabled: not currently used, so saving in Fish startup costs.
command -v starship >/dev/null; and starship init fish | source
