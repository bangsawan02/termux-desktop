/function create_shell_script() {/,/if \[\[ ! -f "\$script_path" \]\]; then/c\
function create_shell_script() {\
	local script_path="$1"\
	local shell_setup_content="$2"\
	# Create directory if it doesn't exist\
	mkdir -p "$(dirname "$script_path")"\
	cat <<-EOF >"$script_path"\
		#!/data/data/com.termux/files/usr/bin/bash\
		# Repository URLs\
		readonly REPO_OWNER="$REPO_OWNER"\
		readonly REPO_NAME="$REPO_NAME"\
		readonly REPO_BRANCH_MAIN="$REPO_BRANCH_MAIN"\
		readonly REPO_SETUP_FILE_BRANCH="$REPO_SETUP_FILE_BRANCH"\
		readonly REPO_SETUP_FILES_FOLDER="$REPO_SETUP_FILES_FOLDER"\
		readonly REPO_RAW_URL="$REPO_RAW_URL"\
		readonly TERMUX_HOME="$TERMUX_HOME"\
		readonly TERMUX_PREFIX="$TERMUX_PREFIX"\
		# Retry configuration\
		readonly MAX_DOWNLOAD_RETRIES="$MAX_DOWNLOAD_RETRIES"\
		readonly MAX_INSTALL_RETRIES="$MAX_INSTALL_RETRIES"\
		readonly DOWNLOAD_TIMEOUT="$DOWNLOAD_TIMEOUT"\
		#########################################################################\
		# Initial Values\
		#########################################################################\
		readonly TERMUX_DESKTOP_PATH="$TERMUX_DESKTOP_PATH"\
		readonly CONFIG_FILE="$CONFIG_FILE"\
		readonly LOG_FILE="$LOG_FILE"\
		LITE_MODE="$LITE_MODE"\
		#########################################################################\
		# Color Setup\
		#########################################################################\
		# shellcheck disable=SC2154\
		R="$R"\
		G="$G"\
		Y="$Y"\
		B="$B"\
		C="$C"\
		NC="$NC"\
		BOLD="$BOLD"\
	EOF\
	typeset -f log_debug print_success print_failed print_warn print_msg check_and_delete pd_package_install_and_check >>"$script_path"\
	echo "$shell_setup_content" >>"$script_path"\
	# Make script executable\
	chmod +x "$script_path"\
	# Verify script was created\
	if [[ ! -f "$script_path" ]]; then
