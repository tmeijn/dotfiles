function weather --description 'What is the weather?' -a location
    if test -z "$location"
        set location "almere"
    end
    set location (string escape --style=url "$location")
    echo "http://wttr.in/$location"
    curl "http://wttr.in/$location"
end
