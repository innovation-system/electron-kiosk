echo '# Installing Electron KIOSK... '
cd ~
curl -s https://api.github.com/repos/innovation-system/electron-kiosk/releases/latest \
| grep "browser_download_url.*AppImage" \
| cut -d : -f 2,3 \
| tr -d \" \
| wget -i -

FILE=$(ls | grep Electron-Kiosk*.AppImage)
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