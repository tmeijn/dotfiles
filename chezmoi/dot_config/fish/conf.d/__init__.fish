# Set fisher plugin path and load these plugins.
# Source: https://github.com/jorgebucaran/fisher/issues/640#issuecomment-1878499811
set fisher_path $__fish_config_dir/plugins

set fish_complete_path $fish_complete_path[1] $fisher_path/completions $fish_complete_path[2..]
set fish_function_path $fish_function_path[1] $fisher_path/functions $fish_function_path[2..]

for file in $fisher_path/conf.d/*.fish
    source $file
end

fish_add_path $HOME/.krew/bin $HOME/.cargo/bin $HOME/.local/bin $HOME/bin

#
# Helpers
#

# Source: https://www.reddit.com/r/fishshell/comments/1fmbypo/is_there_a_nicer_way_to_create_auto_complete_for/lo9vqzz/
function optspec2comp
    string replace -r / "\n-" $argv |
        string replace -r '^' - |
        string replace -r '=$' ""
end
