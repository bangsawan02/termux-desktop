#!/bin/bash
# Mock everything
source setup-termux-desktop 2>/dev/null
source distro-container-setup 2>/dev/null
mkdir -p mock_dir
save_path="mock_dir"
audio_related_packs="pulseaudio"
install_audio_related_packs=$(
	cat <<-IN
		pd_package_install_and_check "$audio_related_packs"
		check_and_delete "install_audio_related_packs.sh"
	IN
)
create_shell_script "$save_path/install_audio_related_packs.sh" "$install_audio_related_packs"
cat $save_path/install_audio_related_packs.sh
