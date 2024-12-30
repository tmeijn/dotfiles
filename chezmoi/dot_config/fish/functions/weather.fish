function weather --description 'What is the weather?' -a location
    if test -z "$location"
        set location "almere"
    end
    set location (string escape --style=url "$location")
    set url "http://wttr.in/$location?QF&lang=nl"
    echo "$url"
    curl "$url"
end
