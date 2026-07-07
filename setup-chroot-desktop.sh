#!/data/data/com.termux/files/usr/bin/bash
#
# Dedicated installer script for Chroot Desktop Environment, GPU Utility, and Browser
# Can be executed standalone to set up a complete hardware-accelerated desktop inside Chroot.
#

# Colors for Android Terminal UI (Simple, clean layout)
R='\033[0;31m'
G='\033[0;32m'
Y='\033[0;33m'
B='\033[0;34m'
M='\033[0;35m'
C='\033[0;36m'
W='\033[0;37m'
NC='\033[0m'
BOLD='\033[1m'

function show_banner() {
	clear
	echo -e "${C}${BOLD}=================================================="
	echo -e "       CHROOT DESKTOP ENVIRONMENT INSTALLER"
	echo -e "==================================================${NC}"
	echo
}

function check_env() {
	if [[ -z "$PREFIX" || "$PREFIX" != *"/com.termux/"* ]]; then
		echo -e "${R}[☓] This script must be run inside Termux!${NC}"
		exit 1
	fi
	if ! command -v su >/dev/null 2>&1; then
		echo -e "${R}[☓] Root/su command not found! Chroot requires a rooted Android device with su access.${NC}"
		exit 1
	fi
	if ! su -c true >/dev/null 2>&1; then
		echo -e "${R}[☓] Failed to obtain root (su) access. Please grant root permissions to Termux.${NC}"
		exit 1
	fi
}

# 1. Initialize environment checks
show_banner
echo -e "${Y}[*] Checking environment prerequisites...${NC}"
check_env

# 2. Try loading settings from existing configuration
CONFIG_FILE="$TERMUX_PREFIX/etc/termux-desktop/configuration.conf"
if [[ -f "$CONFIG_FILE" ]]; then
	echo -e "${G}[✓] Found existing termux-desktop configuration at $CONFIG_FILE${NC}"
	source "$CONFIG_FILE"
fi

# 3. Handle selections if they aren't preconfigured or if they need to be entered
echo -e "${C}[*] Please configure the installation parameters:${NC}"

if [[ -z "$selected_distro" ]]; then
	echo -e "\n${Y}Select Linux Distribution:${NC}"
	echo "1) Debian (Recommended)"
	echo "2) Ubuntu"
	echo "3) Arch Linux"
	echo "4) Fedora"
	read -p "Enter choice [1-4, default: 1]: " distro_choice
	case "$distro_choice" in
		2) selected_distro="ubuntu" ;;
		3) selected_distro="archlinux" ;;
		4) selected_distro="fedora" ;;
		*) selected_distro="debian" ;;
	esac
fi
echo -e "Using distribution: ${G}$selected_distro${NC}"

if [[ -z "$de_name" ]]; then
	echo -e "\n${Y}Select Desktop Environment / Window Manager:${NC}"
	echo "1) XFCE4 (Lightweight & Stable - Recommended)"
	echo "2) LXQt (Extremely Lightweight)"
	echo "3) MATE (Classic Desktop)"
	echo "4) Openbox (Ultra Minimal Window Manager)"
	echo "5) GNOME (Modern)"
	echo "6) i3wm (Tiling Window Manager)"
	read -p "Enter choice [1-6, default: 1]: " de_choice
	case "$de_choice" in
		2) de_name="lxqt" ;;
		3) de_name="mate" ;;
		4) de_name="openbox" ;;
		5) de_name="gnome" ;;
		6) de_name="i3wm" ;;
		*) de_name="xfce" ;;
	esac
fi
echo -e "Using desktop: ${G}$de_name${NC}"

if [[ -z "$pd_hw_answer" ]]; then
	echo -e "\n${Y}Select GPU Utility / Hardware Acceleration Driver:${NC}"
	echo "1) Turnip + Mesa Zink (Recommended for Adreno GPUs, Fast Hardware Acceleration)"
	echo "2) VirGL (Standard Virtual GPU, works on Mali & Adreno)"
	echo "3) Zink (Standard Vulkan-to-OpenGL wrapper)"
	echo "4) None (Software rendering, Slow but universally compatible)"
	read -p "Enter choice [1-4, default: 1]: " hw_choice
	case "$hw_choice" in
		2) pd_hw_answer="virgl" ;;
		3) pd_hw_answer="zink" ;;
		4) pd_hw_answer="none" ;;
		*) pd_hw_answer="turnip" ;;
	esac
fi
echo -e "Using GPU acceleration: ${G}$pd_hw_answer${NC}"

if [[ -z "$installed_browser" ]]; then
	echo -e "\n${Y}Select Web Browser to Install:${NC}"
	echo "1) Firefox"
	echo "2) Chromium"
	echo "3) Both"
	echo "4) Skip"
	read -p "Enter choice [1-4, default: 1]: " browser_choice
	case "$browser_choice" in
		2) installed_browser="chromium" ;;
		3) installed_browser="all" ;;
		4) installed_browser="skip" ;;
		*) installed_browser="firefox" ;;
	esac
fi
echo -e "Using browser: ${G}$installed_browser${NC}"

# Define startup command mappings
case "$de_name" in
	xfce) de_startup="startxfce4" ;;
	lxqt) de_startup="startlxqt" ;;
	openbox) de_startup="openbox-session" ;;
	mate) de_startup="mate-session" ;;
	gnome) de_startup="gnome-session" ;;
	i3wm) de_startup="i3" ;;
	*) de_startup="startxfce4" ;;
esac

# Define environment variables based on acceleration choice
termux_arch=$(dpkg --print-architecture)
case "$pd_hw_answer" in
	turnip)
		pd_hw_method="VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/freedreno_icd.${termux_arch}.json MESA_LOADER_DRIVER_OVERRIDE=zink TU_DEBUG=noconform"
		;;
	virgl)
		pd_hw_method="GALLIUM_DRIVER=virpipe MESA_GL_VERSION_OVERRIDE=4.0"
		;;
	zink)
		pd_hw_method="GALLIUM_DRIVER=zink MESA_GL_VERSION_OVERRIDE=4.0"
		;;
	*)
		pd_hw_method="LIBGL_ALWAYS_SOFTWARE=1 MESA_LOADER_DRIVER_OVERRIDE=llvmpipe"
		;;
esac

# 4. Install host tools on Termux
echo -e "\n${Y}[*] Ensuring Termux host tools are installed...${NC}"
pkg install -y x11-repo pulseaudio || true
pkg install -y termux-x11-nightly || true

# Check and create chroot-distro wrapper if missing
if [[ ! -f "$TERMUX_PREFIX/bin/chroot-distro" ]]; then
	echo -e "${Y}[!] chroot-distro wrapper not found in Termux. Creating it...${NC}"
	mkdir -p "$TERMUX_PREFIX/bin"
	cat <<-'EOF' >"$TERMUX_PREFIX/bin/chroot-distro"
		#!/data/data/com.termux/files/usr/bin/bash

		function check_su_access() {
		    if command -v su >/dev/null 2>&1; then
		        if su -c true >/dev/null 2>&1; then
		            return 0
		        fi
		    fi
		    return 1
		}

		function check_chroot_file() {
		    if ! check_su_access; then
		        return 1
		    fi

		    if su -c 'ls /system/bin/chroot-distro' >/dev/null 2>&1; then
		        return 0
		    fi
		    return 1
		}

		function wait_for_keypress() {
		    read -n1 -s -r -p " Press any key to continue, CTRL+c to cancel..."
		    echo
		}

		function checkup() {
		    local retry_count
		    local max_retries
		    retry_count=0
		    max_retries=3
		    while [ $retry_count -lt $max_retries ]; do
		        if check_chroot_file; then
		            break
		        else
		            ((retry_count++))
		            if [ $retry_count -lt $max_retries ]; then
		                echo "Cannot access /system/bin/chroot-distro file"
		                echo "Please flash:- https://github.com/sabamdarif/chroot-distro"
		                echo "Want to check again (Attempt $retry_count/$max_retries)"
		                wait_for_keypress
		            else
		                echo "Failed to access chroot-distro after $max_retries attempts"
		                echo "Exiting..."
		                exit 1
		            fi
		        fi
		    done
		}

		checkup

		args=""
		for arg in "$@"; do
		    escaped_arg=$(printf '%s' "$arg" | sed "s/'/'\\\\''/g")
		    args="$args '$escaped_arg'"
		done

		su -c "/system/bin/chroot-distro $args"
	EOF
	chmod +x "$TERMUX_PREFIX/bin/chroot-distro"
fi

# 5. Bootstrap chroot distribution if missing
container_rootfs="$TERMUX_PREFIX/var/lib/chroot-distro/containers/$selected_distro/rootfs"
if ! su -c "ls $container_rootfs" &>/dev/null; then
	echo -e "${Y}[*] Chroot container '$selected_distro' not found. Installing now...${NC}"
	chroot-distro install "$selected_distro"
else
	echo -e "${G}[✓] Chroot container '$selected_distro' is already installed.${NC}"
fi

# 6. Install desktop environment, GPU driver dependencies, and web browser
echo -e "\n${Y}[*] Bootstrapping packages inside chroot container...${NC}"

if [[ "$selected_distro" == "debian" || "$selected_distro" == "ubuntu" ]]; then
	echo -e "${Y}[*] Updating package repositories inside container...${NC}"
	chroot-distro login "$selected_distro" --shared-tmp -- /bin/bash -c "apt update"

	# Desktop environment installation packages
	case "$de_name" in
		xfce) de_packages="xfce4 xfce4-goodies dbus-x11" ;;
		lxqt) de_packages="lxqt openbox dbus-x11" ;;
		mate) de_packages="mate-desktop-environment dbus-x11" ;;
		openbox) de_packages="openbox polybar lxappearance feh rofi dbus-x11" ;;
		gnome) de_packages="gnome-shell gnome-session dbus-x11" ;;
		i3wm) de_packages="i3-wm rofi feh dbus-x11" ;;
		*) de_packages="xfce4 xfce4-goodies dbus-x11" ;;
	esac

	echo -e "${Y}[*] Installing desktop packages ($de_name)...${NC}"
	chroot-distro login "$selected_distro" --shared-tmp -- /bin/bash -c "apt install -y $de_packages"

	# Browser installation packages
	browser_packages=""
	if [[ "$installed_browser" == "firefox" || "$installed_browser" == "all" ]]; then
		browser_packages+=" firefox"
	fi
	if [[ "$installed_browser" == "chromium" || "$installed_browser" == "all" ]]; then
		browser_packages+=" chromium"
	fi
	if [[ -n "$browser_packages" ]]; then
		echo -e "${Y}[*] Installing browser packages ($installed_browser)...${NC}"
		chroot-distro login "$selected_distro" --shared-tmp -- /bin/bash -c "apt install -y $browser_packages"
	fi

	# GPU Driver dependencies inside container
	if [[ "$pd_hw_answer" == "turnip" ]]; then
		echo -e "${Y}[*] Installing packages required for Turnip driver...${NC}"
		chroot-distro login "$selected_distro" --shared-tmp -- /bin/bash -c "apt install -y xdg-desktop-portal libgl1 libgl1-mesa-dri libvulkan1 mesa-vulkan-drivers unzip curl"
	fi

elif [[ "$selected_distro" == "archlinux" ]]; then
	echo -e "${Y}[*] Updating package repositories inside container...${NC}"
	chroot-distro login "$selected_distro" --shared-tmp -- /bin/bash -c "pacman -Sy --noconfirm"

	case "$de_name" in
		xfce) de_packages="xfce4 xfce4-goodies dbus" ;;
		lxqt) de_packages="lxqt openbox dbus" ;;
		mate) de_packages="mate mate-extra dbus" ;;
		openbox) de_packages="openbox polybar lxappearance feh rofi dbus" ;;
		i3wm) de_packages="i3-wm rofi feh dbus" ;;
		*) de_packages="xfce4 xfce4-goodies dbus" ;;
	esac

	echo -e "${Y}[*] Installing desktop packages ($de_name)...${NC}"
	chroot-distro login "$selected_distro" --shared-tmp -- /bin/bash -c "pacman -S --noconfirm $de_packages"

	browser_packages=""
	if [[ "$installed_browser" == "firefox" || "$installed_browser" == "all" ]]; then
		browser_packages+=" firefox"
	fi
	if [[ "$installed_browser" == "chromium" || "$installed_browser" == "all" ]]; then
		browser_packages+=" chromium"
	fi
	if [[ -n "$browser_packages" ]]; then
		echo -e "${Y}[*] Installing browser packages ($installed_browser)...${NC}"
		chroot-distro login "$selected_distro" --shared-tmp -- /bin/bash -c "pacman -S --noconfirm $browser_packages"
	fi

	if [[ "$pd_hw_answer" == "turnip" ]]; then
		echo -e "${Y}[*] Installing packages required for Turnip driver...${NC}"
		chroot-distro login "$selected_distro" --shared-tmp -- /bin/bash -c "pacman -S --noconfirm xdg-desktop-portal mesa vulkan-icd-loader vulkan-mesa-layers unzip curl"
	fi

elif [[ "$selected_distro" == "fedora" ]]; then
	echo -e "${Y}[*] Updating package repositories inside container...${NC}"
	chroot-distro login "$selected_distro" --shared-tmp -- /bin/bash -c "dnf check-update || true"

	case "$de_name" in
		xfce) de_packages="@xfce-desktop-environment dbus-x11" ;;
		lxqt) de_packages="@lxqt-desktop-environment dbus-x11" ;;
		mate) de_packages="@mate-desktop-environment dbus-x11" ;;
		openbox) de_packages="openbox polybar lxappearance feh rofi dbus-x11" ;;
		i3wm) de_packages="i3-wm rofi feh dbus-x11" ;;
		*) de_packages="@xfce-desktop-environment dbus-x11" ;;
	esac

	echo -e "${Y}[*] Installing desktop packages ($de_name)...${NC}"
	chroot-distro login "$selected_distro" --shared-tmp -- /bin/bash -c "dnf install -y $de_packages"

	browser_packages=""
	if [[ "$installed_browser" == "firefox" || "$installed_browser" == "all" ]]; then
		browser_packages+=" firefox"
	fi
	if [[ "$installed_browser" == "chromium" || "$installed_browser" == "all" ]]; then
		browser_packages+=" chromium"
	fi
	if [[ -n "$browser_packages" ]]; then
		echo -e "${Y}[*] Installing browser packages ($installed_browser)...${NC}"
		chroot-distro login "$selected_distro" --shared-tmp -- /bin/bash -c "dnf install -y $browser_packages"
	fi

	if [[ "$pd_hw_answer" == "turnip" ]]; then
		echo -e "${Y}[*] Installing packages required for Turnip driver...${NC}"
		chroot-distro login "$selected_distro" --shared-tmp -- /bin/bash -c "dnf install -y xdg-desktop-portal mesa-libGL mesa-dri-drivers vulkan-loader mesa-vulkan-drivers unzip curl"
	fi
fi

# 7. Configure Turnip / GPU driver if Turnip was selected
if [[ "$pd_hw_answer" == "turnip" ]]; then
	echo -e "\n${Y}[*] Downloading Turnip driver Mesa 26.0.1...${NC}"
	TURNIP_URL="https://github.com/bangsawan02/termux-desktop/releases/download/turnip-26.0.1/turnip-26.0.1-${termux_arch}.zip"
	mkdir -p "$TERMUX_PREFIX/tmp"
	curl -Lf "$TURNIP_URL" -o "$TERMUX_PREFIX/tmp/turnip.zip"
	if [[ -f "$TERMUX_PREFIX/tmp/turnip.zip" ]]; then
		echo -e "${Y}[*] Installing Turnip driver into Chroot container...${NC}"
		# We unzip directly into /usr of the container's rootfs (with root access)
		su -c "unzip -o $TERMUX_PREFIX/tmp/turnip.zip -d $container_rootfs/usr"
		rm -f "$TERMUX_PREFIX/tmp/turnip.zip"
		echo -e "${G}[✓] Turnip driver installed successfully inside Chroot container!${NC}"
	else
		echo -e "${R}[☓] Failed to download Turnip driver ZIP. Please check your internet connection.${NC}"
	fi
fi

# 8. Create standard launchers on host
if [[ ! -f "$TERMUX_PREFIX/bin/pdrun" ]]; then
	echo -e "\n${Y}[*] Creating pdrun helper...${NC}"
	cat <<-EOF >"$TERMUX_PREFIX/bin/pdrun"
		#!/data/data/com.termux/files/usr/bin/bash
		xhost + > /dev/null 2>&1
		gpu_env="env DISPLAY=\$(echo \$DISPLAY) XDG_RUNTIME_DIR=\${TMPDIR} $pd_hw_method"
		chroot-distro login "$selected_distro" --shared-tmp -- env \$gpu_env sh -lc 'exec "\$@"' _ "\$@"
	EOF
	chmod +x "$TERMUX_PREFIX/bin/pdrun"
fi

LAUNCH_SCRIPT="$TERMUX_PREFIX/bin/start-chroot-desktop"
echo -e "\n${Y}[*] Creating Termux:X11 launcher script at $LAUNCH_SCRIPT...${NC}"

cat <<-EOF >"$LAUNCH_SCRIPT"
	#!/data/data/com.termux/files/usr/bin/bash
	# Launcher script to open Chroot Desktop Environment in Termux:X11

	# Kill existing instances
	pkill -f termux-x11
	pulseaudio --kill >/dev/null 2>&1 || true

	echo "Starting pulseaudio..."
	pulseaudio --start --exit-idle-time=-1 >/dev/null 2>&1 || true

	echo "Starting Termux:X11 display server :1..."
	# Starts the Termux:X11 app with the display :1
	termux-x11 :1 -xstartup "pdrun dbus-launch --exit-with-session $de_startup" >/dev/null 2>&1 &

	echo "Starting desktop environment..."
	sleep 2

	# Launches the Termux:X11 app UI on Android
	am start --user 0 -n com.termux.x11/com.termux.x11.MainActivity >/dev/null 2>&1 || true

	echo "--------------------------------------------------------"
	echo "Chroot Desktop ($de_name) is starting up!"
	echo "Open the Termux:X11 app on your device to view it."
	echo "To stop, run: pkill -f termux-x11"
	echo "--------------------------------------------------------"
EOF

chmod +x "$LAUNCH_SCRIPT"
cp "$LAUNCH_SCRIPT" "$HOME/start-chroot-desktop.sh"
chmod +x "$HOME/start-chroot-desktop.sh"

show_banner
echo -e "${G}${BOLD}[✓] INSTALLATION COMPLETED SUCCESSFULLY!${NC}"
echo -e "--------------------------------------------------------"
echo -e "Your ${BOLD}Chroot Desktop Environment${NC} has been fully configured."
echo -e "- Distro: ${C}$selected_distro${NC}"
echo -e "- Desktop Environment: ${C}$de_name${NC}"
echo -e "- GPU Utility: ${C}$pd_hw_answer${NC}"
echo -e "- Web Browser: ${C}$installed_browser${NC}"
echo -e "--------------------------------------------------------"
echo -e "To launch your desktop on Termux:X11, run:"
echo -e "  ${BOLD}start-chroot-desktop${NC}"
echo -e "or"
echo -e "  ${BOLD}./start-chroot-desktop.sh${NC}"
echo -e "--------------------------------------------------------"
