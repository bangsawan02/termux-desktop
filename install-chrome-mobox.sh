#!/data/data/com.termux/files/usr/bin/bash

# Pastikan Mobox dari olegos2 sudah terinstal
if [ ! -d "$PREFIX/glibc" ]; then
    echo "[-] Mobox belum terinstal! Silakan install dari https://github.com/olegos2/mobox terlebih dahulu."
    exit 1
fi

CHROME_URL="https://dl.google.com/chrome/install/GoogleChromeStandaloneEnterprise64.msi"
INSTALLER="$PREFIX/tmp/ChromeStandaloneSetup64.msi"

mkdir -p "$PREFIX/tmp"
echo "[*] Mendownload Google Chrome (Standalone 64-bit)..."
if ! curl -L "$CHROME_URL" -o "$INSTALLER"; then
    echo "[-] Gagal mendownload installer Chrome. Coba cek koneksi internet."
    exit 1
fi

# Agar kita bisa memanggil 'wine' secara langsung dari Termux (di luar menu mobox),
# kita butuh script wrapper untuk mobox.
if [ ! -x "$PREFIX/bin/wine" ]; then
    echo "[*] Menambahkan command 'wine' wrapper untuk Mobox..."
    curl -sL "https://raw.githubusercontent.com/LinuxDroidMaster/Termux-Desktops/main/scripts/termux_native/mobox_run.sh" -o "$PREFIX/bin/wine"
    chmod +x "$PREFIX/bin/wine"
fi

echo "[*] Menjalankan installer Chrome di dalam Mobox/Wine (Silent mode)..."
# Menjalankan instalasi chrome secara silent
wine msiexec /i "$INSTALLER" /q

echo "[+] Proses instalasi Chrome selesai."

echo "[*] Membuat shortcut desktop di $PREFIX/share/applications/google-chrome-mobox.desktop..."
mkdir -p "$PREFIX/share/applications"
cat << 'CHROME_EOF' > "$PREFIX/share/applications/google-chrome-mobox.desktop"
[Desktop Entry]
Name=Google Chrome (Mobox)
Comment=Web Browser via Mobox/Wine
Exec=wine "C:/Program Files/Google/Chrome/Application/chrome.exe"
Icon=google-chrome
Terminal=false
Type=Application
Categories=Network;WebBrowser;
CHROME_EOF

chmod +x "$PREFIX/share/applications/google-chrome-mobox.desktop"
echo "[+] Shortcut berhasil dibuat! Silakan jalankan Termux:X11 dan cek di menu aplikasi Anda."
