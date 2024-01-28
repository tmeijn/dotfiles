#!/usr/bin/env bash

echo ""
echo "==============================================================="
echo ""
echo "Swapping Fn key and CTRL, setting Fn key to released..."
echo ""
echo "==============================================================="
echo ""

# Change Fn key to be released by default
if [ -d /etc/modprobe.d ]; then
  sudo bash -c 'cat <<- EOF > /etc/modprobe.d/hid_apple.conf
options hid_apple swap_fn_leftctrl=1
options hid_apple fnmode=2
EOF'
else
  echo "Modprobe directory not found, skipping."
fi
