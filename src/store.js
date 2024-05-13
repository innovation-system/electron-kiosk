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
				multipleDisplays: {
					type: 'boolean',
					default: false
				},
				displays: {
					type: 'array',
					default: [],
					items: {
						type: 'object',
						properties: {
							id: {
								type: 'number',
								default: 0
							},
							url: {
								type: 'string',
								default: ''
							}
						}
					}
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
				autoReloadMode: {
					type: 'string',
					default: 'every'
				},
				autoReloadHour: {
					type: 'number',
					default: 0
				},
				autoReloadEvery: {
					type: 'string',
					default: '1h30m'
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
			autoReloadMode: 'every',
			autoReloadHour: 0, // midnight
			autoReloadEvery: '1h30m'
		}
	}
})

export default store
