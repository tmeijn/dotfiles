#!/usr/bin/env -S bash -i

_workspace_dir="${HOME}/workspace"

echo "Checking if all prerequisites are set..."
if ! command -v ghorg &> /dev/null; then echo "ghorg not found!" && exit 1; fi

if [ -z ${GITLAB_TOKEN+x} ] &> /dev/null; then echo "GITLAB_TOKEN not set!" && exit 1; fi
if [ -z ${GITHUB_TOKEN+x} ] &> /dev/null; then echo "GITHUB_TOKEN not set!" && exit 1; fi

ghorg reclone --list

echo ""
echo "==============================================================="
echo ""
echo "Cloning specified repositories into ${_workspace_dir}"
echo ""
echo "==============================================================="
echo ""

echo "Waiting 10 seconds before proceeding"
sleep 10

mkdir -p "${_workspace_dir}"

export GHORG_ABSOLUTE_PATH_TO_CLONE_TO="${_workspace_dir}"
export GHORG_GITLAB_TOKEN="${GITLAB_TOKEN}"
export GHORG_GITHUB_TOKEN="${GITHUB_TOKEN}"

ghorg reclone --env-config-only
