#!/usr/bin/env -S bash

echo ""
echo "==============================================================="
echo ""
echo "Reboot system"
echo ""
echo "==============================================================="
echo ""

# Function to handle cleanup and exit
cleanup_and_exit() {
  echo -e "\nReboot aborted. Exiting script with a zero exit code."
  exit 0
}

# Function to perform the actual reboot
perform_reboot() {
  echo -e "\rRebooting now!"
  reboot
}

echo "Rebooting in 10 seconds. Type 'x' and press Enter to cancel the reboot."

for i in {10..1}; do
  echo -ne "\rRebooting in $i seconds... "

  # Check for user input in the background
  read -t 1 -n 1 user_input
  if [ "$user_input" == "x" ]; then
    cleanup_and_exit
  fi
done

# If the loop completes, perform the reboot
perform_reboot
