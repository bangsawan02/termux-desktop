#!/bin/bash
echo "Fixing distro-container-setup"
sed -i 's/> "${save_root_path}\/packinstall.sh" >\/dev\/null/> "${save_root_path}\/packinstall.sh"/g' distro-container-setup
sed -i 's/> "${save_root_path}\/packremove.sh" >\/dev\/null/> "${save_root_path}\/packremove.sh"/g' distro-container-setup
