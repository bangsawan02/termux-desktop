/if \[\[ "\$selected_distro_type" == "chroot" \]\]; then/,/fi/ {
  /if ! sudo grep -q "export PULSE_SERVER="/ {
    c\
	if ! grep -q "export PULSE_SERVER=" "$distro_path/etc/profile" 2>/dev/null; then\
		echo "export PULSE_SERVER=127.0.0.1" >>"$distro_path/etc/profile"\
	fi
  }
}
