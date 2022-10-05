const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
	transpileDependencies: ['vuetify'],
	pluginOptions: {
		electronBuilder: {
			builderOptions: {
				appId: 'com.innovation-system.electron-kiosk',
				productName: 'Electron-Kiosk',
				win: {
					// https://www.electron.build/configuration/win
					icon: './icons/win/app.ico',
					target: [
						{
							target: 'nsis',
							arch: ['x64', 'ia32']
						}
					]
				},
				mac: {
					// https://www.electron.build/configuration/mac
					icon: './icons/mac/icon.icns'
				},
				linux: {
					// https://www.electron.build/configuration/linux
					icon: './icons/png/256x256.png',
					category: 'Utility'
				}
			}
		}
	}
})
