abbr --add fish-reload-config 'source ~/.config/fish/**/*.fish'
abbr --add g_commit_and_push --set-cursor 'git commit -am "%" && git push'
abbr --add starwars  'telnet towel.blinkenlights.nl'
abbr --add agi 'aqua g -g -i'
abbr --add fish-reload-config 'source ~/.config/fish/**/*.fish'


abbr --position anywhere --add p0 "&> /dev/null" # Pipe everything to /dev/null

# Function to set abbreviation if command exists
function set_abbr_if_cmd_exists
    set -l cmd $argv[1]
    set -l abbr_name $argv[2]
    set -l abbr_value $argv[3]
    if command -v $cmd >/dev/null
        abbr -a $abbr_name $abbr_value
    end
end

# Function to set environment variable if command exists
function set_env_if_cmd_exists
    set -l cmd $argv[1]
    set -l var_name $argv[2]
    set -l var_value $argv[3]
    if command -v $cmd >/dev/null
        set -gx $var_name $var_value
    end
end

# Aqua installed tools
set_abbr_if_cmd_exists eza ls eza
set_abbr_if_cmd_exists eza ll "eza -al"
set_abbr_if_cmd_exists bat cat bat
set_abbr_if_cmd_exists gping ping gping
set_abbr_if_cmd_exists hwatch watch hwatch
set_abbr_if_cmd_exists lazydocker lzd lazydocker
set_abbr_if_cmd_exists lazygit lzg lazygit
set_abbr_if_cmd_exists gomi rm gomi
set_abbr_if_cmd_exists lstr tree "lstr -g --icons"
set_abbr_if_cmd_exists pgcli psql pgcli
set_abbr_if_cmd_exists glab lab glab

# Mise installed tools
set_env_if_cmd_exists moor PAGER "moor -no-clear-on-exit"
set_env_if_cmd_exists moor MOOR "--statusbar=bold --no-clear-on-exit --quit-if-one-screen"
set_env_if_cmd_exists glab FORCE_HYPERLINKS "1" # Force hyperlinks on glab cli output.
