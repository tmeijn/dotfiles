function profile_shell_startup --description 'Profile fish shell startup time'
    set shellname fish
    set fprof $__fish_config_dir/fishprof.txt
    fish --profile-startup=$fprof -i -c exit
    awk 'NR==1 || $3==">"{print}' $fprof | string replace $HOME '~'

    read -l -P "Do you want to see the sorted profile results? (y/N) " confirm
    switch $confirm
        case Y y
            sort -nk2 $fprof
        case '' N n
            echo "Sorting skipped."
    end
end
