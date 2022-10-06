import Store from 'electron-store'

const store = new Store({
	watch: true, // watch config changes https://github.com/sindresorhus/electron-store#watch
	schema: {
		settings: {
			type: 'object',
			properties: {
				url: {
					type: 'string',
					default: 'https://www.on-system.net'
				},
				autoLoad: {
					type: 'boolean',
					default: false
				},
				dark: {
					type: 'boolean',
					default: true
				},
				cacheLimit: {
					type: 'number',
					default: 500
				},
				autoReload: {
					type: 'boolean',
					default: false
				},
				autoReloadHour: {
					type: 'integer',
					minimum: 0,
					maximum: 23,
					default: 0
				}
			}
		}
	},
	defaults: {
		settings: {
			url: 'https://www.on-system.net',
			autoLoad: false,
			dark: true,
			cacheLimit: 500,
			autoReload: false,
			autoReloadHour: 0 // midnight
		}
	}
})

export default store
