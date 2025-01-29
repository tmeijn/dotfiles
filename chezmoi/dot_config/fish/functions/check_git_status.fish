# Function to check if a git repository has pending changes
function check_git_status
    find . -type d -name ".git" ! -path "*/.terraform/modules*" -exec dirname {} \; | while read -l dir
        if test -d "$dir/.git"
            pushd "$dir" >/dev/null; or return
            if git status --porcelain | grep -q .
                echo "=== Pending changes in $dir ==="
                git status -s
            end
            popd >/dev/null; or return
        end
    end
end
