complete -c assume -e

complete -f -c assume

complete -f -c assume -n "__fish_is_first_arg" -a "(aws configure list-profiles)"
