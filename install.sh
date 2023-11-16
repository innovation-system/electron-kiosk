echo '# Installing Electron KIOSK... '
cd ~
# Get arch

getUrl() {
	ARCH=$(uname -m)
	if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
		grep "browser_download_url.*-arm64.AppImage"
	else
		grep "browser_download_url.*.AppImage" \
		| grep -v "browser_download_url.*-arm64.AppImage" 
	fi
}

curl -s https://api.github.com/repos/innovation-system/electron-kiosk/releases/latest \
	| getUrl \
	| cut -d : -f 2,3 \
	| tr -d \" \
	| wget -i -


FILE=$(ls | grep electron-kiosk*.AppImage)
# Create .desktop on ~/.config/autostart
mkdir -p ~/.config/autostart
echo "[Desktop Entry]
Type=Application
Name=Electron Kiosk
Exec=$(pwd)/$FILE
X-GNOME-Autostart-enabled=true
	" > ~/.config/autostart/electron-kiosk.desktop

chmod +x $FILE

	# create symlink to desktop
ln -sf $(pwd)/$FILE $(xdg-user-dir DESKTOP)/On-Board

echo '# Electron KIOSK installed and starting on BOOT'