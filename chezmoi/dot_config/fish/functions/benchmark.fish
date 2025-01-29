function benchmark \
    --description 'benchmark a shell' \
    --argument-names shellname

    test -n "$shellname" || set shellname fish
    echo "running $shellname 10 times..."
    for i in (seq 10)
        /usr/bin/time -f "\t%E real,\t%U user,\t%S sys" $shellname -i -c exit
    end
end
