#!/bin/bash
source setup-termux-desktop 2>/dev/null
source distro-container-setup 2>/dev/null
script_path="test_audio.sh"
shell_setup_content=$(cat <<-IN
pd_package_install_and_check "pulseaudio"
IN
)
create_shell_script "$script_path" "$shell_setup_content"
cat "$script_path" | head -n 15
