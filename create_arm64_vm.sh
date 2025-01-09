#!/usr/bin/env bash

# Set strict error handling
set -euo pipefail

# Configuration variables
VM_NAME="arm64-vm"
CPU_LIMIT=8
MEMORY="8GiB"
IMAGE="images:ubuntu/24.04"
DISK_SIZE="50GiB"
NEW_USER="tmeijn"
NEW_USER_PASSWORD="test"

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if VM exists
check_vm_exists() {
    incus info "$VM_NAME" >/dev/null 2>&1
}

# Function to delete VM if it exists
delete_existing_vm() {
    if check_vm_exists; then
        log "Deleting existing VM: $VM_NAME"
        incus delete "$VM_NAME" --force || {
            log "Error: Failed to delete VM"
            exit 1
        }
    fi
}

# Function to create and configure VM
create_vm() {
    log "Creating new VM: $VM_NAME"
    incus create "$IMAGE" "$VM_NAME" --vm \
        -c "limits.cpu=$CPU_LIMIT" \
        -c "limits.memory=$MEMORY" || {
        log "Error: Failed to create VM"
        exit 1
    }
    incus config device override "$VM_NAME" root "size=${DISK_SIZE}" || {
        log "Error: Failed to set disk size for VM"
        exit 1
    }
    incus start "$VM_NAME" || {
        log "Error: Failed to start VM"
        exit 1
    }
}

# Function to install desktop environment
install_desktop() {
    log "Updating system packages"
    incus exec "$VM_NAME" -- bash -c "apt update && apt upgrade -y" || {
        log "Error: Failed to update packages"
        exit 1
    }

    log "Installing Ubuntu desktop"
    incus exec "$VM_NAME" -- bash -c "DEBIAN_FRONTEND=noninteractive apt install -y ubuntu-desktop" || {
        log "Error: Failed to install desktop environment"
        exit 1
    }
}

# Function to setup user
setup_user() {
    log "Setting up new user: $NEW_USER"
    incus exec "$VM_NAME" -- bash -c "useradd -m -G sudo -s /bin/bash $NEW_USER && echo '$NEW_USER:$NEW_USER_PASSWORD' | chpasswd" || {
        log "Error: Failed to create user or set password"
        exit 1
    }
}

# Function to reboot VM
reboot_vm() {
    log "Rebooting VM"
    incus restart "$VM_NAME" || {
        log "Error: Failed to reboot VM"
        exit 1
    }
}

# Function to create snapshot of VM
create_snapshot() {
    log "Creating snapshot of VM"
    incus snapshot create "$VM_NAME" initial-state || {
        log "Error: Failed to create snapshot"
        exit 1
    }
}

# Main execution
main() {
    log "Starting VM creation process"

    delete_existing_vm
    create_vm

    # Wait for VM to be ready
    sleep 10

    install_desktop

    setup_user

    reboot_vm

    create_snapshot

    log "VM setup completed successfully"
}

# Execute main function
main
