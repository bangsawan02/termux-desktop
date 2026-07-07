#!/bin/bash
sed '/install_termux_desktop "\$1"/,$d' setup-termux-desktop > test_setup.sh
sed -i 's/check_termux$//g' test_setup.sh
sed '/install_distro_container/,$d' distro-container-setup > test_distro.sh
source test_setup.sh
source test_distro.sh
create_shell_script "test_out.sh" "echo hello"
cat test_out.sh | grep "download_file"
