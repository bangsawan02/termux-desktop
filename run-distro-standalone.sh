#!/bin/bash
export selected_distro_type="chroot"
export selected_distro="debian"
export pd_useradd_answer="n"
# ... other required variables ...
source ./distro-container-setup
run_distro_container_setup_main
