#!/usr/bin/env -S bash -i

# Change Fn key to be released by default
if [ -d /sys/module/hid_apple ]; then
  echo 2 | sudo tee /sys/module/hid_apple/parameters/fnmode
  echo 1 | sudo tee /sys/module/hid_apple/parameters/swap_fn_leftctrl
fi
