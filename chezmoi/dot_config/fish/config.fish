# Some nice resources
# - https://www.reddit.com/r/fishshell/comments/1he9bd8/what_are_you_abbreviations/
# - https://www.reddit.com/r/fishshell/comments/1gp750x/can_i_see_your_fish_configs/

set -x TF_CLI_ARGS_plan "-lock=false"
set -x TF_HTTP_USERNAME tmeijn

# Everything below this should only be loaded on interactive shells.
if ! status is-interactive
    return 0
end

set -U fish_greeting
# Slows shell down :(
# set -g fish_greeting "Random fact of the day: $(curl -sSL https://uselessfacts.jsph.pl/api/v2/facts/today | jq -r '.text')"


if command -v git-town &> /dev/null
    alias gt='git-town'
end

if type -q kubectl
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

if type -q aws_completer
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
type -q fixit; and fixit init fish | source
type -q zoxide; and zoxide init --cmd cd fish | source
type -q atuin; and atuin init fish | source
#type -q savvy; and savvy init fish | source # Disabled: not currently used, so saving in Fish startup costs.
type -q starship; and starship init fish | source
