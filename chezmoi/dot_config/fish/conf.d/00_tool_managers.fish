# Set Aqua variables and paths
if set -q XDG_DATA_HOME
  set -gx AQUA_ROOT_DIR "$XDG_DATA_HOME/aquaproj-aqua"
else
  set -gx AQUA_ROOT_DIR "$HOME/.local/share/aquaproj-aqua"
end

fish_add_path "$AQUA_ROOT_DIR/bin"

if set -q XDG_CONFIG_HOME
  set -gx AQUA_GLOBAL_CONFIG "$XDG_CONFIG_HOME/aquaproj-aqua/aqua.yaml"
else
  set -gx AQUA_GLOBAL_CONFIG "$HOME/.config/aquaproj-aqua/aqua.yaml"
end

set -gx AQUA_GENERATE_WITH_DETAIL true

if ! status is-interactive; and type -q mise
  mise activate fish --shims | source
else
  mise activate fish | source
  mise hook-env -s fish | source
  # Mise itself doesn't export this as a variable as Aqua does do, so we do it ourself.
  set -gx MISE_GLOBAL_CONFIG (mise config ls --no-header | head -n1 | awk '{print $1}')
  set -gx MISE_GLOBAL_CONFIG (string replace -a '~' $HOME $MISE_GLOBAL_CONFIG)
end
