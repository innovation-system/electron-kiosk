const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
	transpileDependencies: ['vuetify'],
	devServer: {
		port: 8000
	},
	pluginOptions: {
		electronBuilder: {
			// https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/
			preload: 'src/preload.js',
			builderOptions: {
				appId: 'com.innovation-system.electron-kiosk',
				productName: 'Electron-Kiosk',
				win: {
					// https://www.electron.build/configuration/win
					target: [
						{
							target: 'nsis',
							arch: ['x64', 'ia32']
						}
					]
				},
				mac: {
					// https://www.electron.build/configuration/mac
				},
				linux: {
					// https://www.electron.build/configuration/linux
					category: 'Utility',
					packageCategory: 'utils',
					icon: 'build/icons'
				}
			}
		}
	}
})
