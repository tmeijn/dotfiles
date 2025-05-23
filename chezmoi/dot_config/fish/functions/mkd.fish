function mkd -a dir --description "Create a dir at path and navigate to it."
    set -l dir $argv[1]
    if test -z $dir
        echo "Usage: mkd <dir>"
        return 1
    else if test -d $dir
        echo "$dir already exists, entering it"
        cd $dir
        return 0
    else if test -e $dir
        echo "$dir exists but is not a directory"
        return 2
    end

    mkdir -p $dir && cd $dir
end
