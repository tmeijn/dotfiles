# Set Aqua variables and paths
if set -q XDG_DATA_HOME
    set -gx AQUA_ROOT_DIR "$XDG_DATA_HOME/aquaproj-aqua"
else
    set -gx AQUA_ROOT_DIR "$HOME/.local/share/aquaproj-aqua"
end

set -gx PATH "$AQUA_ROOT_DIR/bin" $PATH

if set -q XDG_CONFIG_HOME
    set -gx AQUA_GLOBAL_CONFIG "$XDG_CONFIG_HOME/aquaproj-aqua/aqua.yaml"
else
    set -gx AQUA_GLOBAL_CONFIG "$HOME/.config/aquaproj-aqua/aqua.yaml"
end

set -gx AQUA_GENERATE_WITH_DETAIL true
