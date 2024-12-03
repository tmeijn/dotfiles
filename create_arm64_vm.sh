#!/usr/bin/env bash

incus launch images:ubuntu/24.04 v1 --vm -c limits.cpu=4 -c limits.memory=4GiB

incus exec ubuntu-vm3 bash

# adduser tmeijn

apt update && apt upgrade
apt install ubuntu-desktop
