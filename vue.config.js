const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
	transpileDependencies: ['vuetify'],
	pluginOptions: {
		electronBuilder: {
			builderOptions: {
				appId: 'com.innovation-system.electron-kiosk',
				productName: 'Electron-Kiosk',

				win: {
					// icon: './public/app.ico',
					target: [
						{
							target: 'nsis',
							arch: ['x64', 'ia32']
						}
					]
				}
			}
		}
	}
})
