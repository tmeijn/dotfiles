#!/usr/bin/env bash

echo ""
echo "==============================================================="
echo ""
echo "Installing Aqua and Aqua managed tools"
echo ""
echo "==============================================================="
echo ""

curl -sSfL https://raw.githubusercontent.com/aquaproj/aqua-installer/v4.0.2/aqua-installer | bash

echo "Setting Aqua environment variables..."
export AQUA_ROOT_DIR="${XDG_DATA_HOME:-$HOME/.local/share/aquaproj-aqua}"
export PATH="${AQUA_ROOT_DIR}/bin:$PATH"
export AQUA_GLOBAL_CONFIG=${AQUA_GLOBAL_CONFIG:-${XDG_CONFIG_HOME:-$HOME/.config}/aquaproj-aqua/aqua.yaml}
export AQUA_GENERATE_WITH_DETAIL=true
