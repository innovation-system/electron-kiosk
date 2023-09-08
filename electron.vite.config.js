import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

import { resolve } from 'path'

// example from https://github.com/alex8088/electron-vite-boilerplate/blob/master/electron.vite.config.ts

// electron.vite.config.js
export default {
	main: {
		// vite config options
	},
	preload: {
		// vite config options
	},
	renderer: {
		// vite config options
		plugins: [
			vue(),
			vuetify({
				autoImport: true
			})
		],
		resolve: {
			alias: {
				'@renderer': resolve('src/renderer/src')
			}
		}
	}
}
