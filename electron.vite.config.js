import vue2 from '@vitejs/plugin-vue2'
import { resolve } from 'path'

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
		plugins: [vue2()],
		resolve: {
			alias: {
				'@renderer': resolve('src/renderer/src')
			}
		}
	}
}
