#!/usr/bin/env -S bash -i

echo "Checking if all prerequisites are set..."
if ! command -v glab &> /dev/null; then echo "glab not found!" && exit 1; fi
if ! command -v gh &> /dev/null; then echo "gh not found!" && exit 1; fi

if [ -z ${GITLAB_TOKEN+x} ] &> /dev/null; then echo "GITLAB_TOKEN not set!" && exit 1; fi
if [ -z ${GITHUB_TOKEN+x} ] &> /dev/null; then echo "GITHUB_TOKEN not set!" && exit 1; fi

_user_full_name="$(getent passwd | grep "^$(whoami)" | cut -d":" -f5 | cut -d"," -f1)"
_ssh_key_title="${_user_full_name}'s $(lshw -json| jq -r .product), serial $(lshw -json | jq -r .serial) (Auto-added by Chezmoi)"
echo "$_ssh_key_title"

echo ""
echo "==============================================================="
echo ""
echo "Generating SSH key and adding to both gitlab.com and github.com"
echo ""
echo "==============================================================="
echo ""

ssh-keygen -t ed25519

gh ssh-key add "${HOME}/.ssh/id_ed25519.pub" --title "${_ssh_key_title}"
gh ssh-key add "${HOME}/.ssh/id_ed25519.pub" --title "${_ssh_key_title}" --type signing
glab ssh-key add "${HOME}/.ssh/id_ed25519.pub" --title "${_ssh_key_title}"

echo "Adding gitlab.com to SSH Known Hosts..."
ssh-keyscan -H gitlab.com >> "${HOME}/.ssh/known_hosts"

echo "Adding github.com to SSH Known Hosts..."
ssh-keyscan -H github.com >> "${HOME}/.ssh/known_hosts"
