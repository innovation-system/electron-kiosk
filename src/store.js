import Store from 'electron-store'

const store = new Store({
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
				}
			}
		}
	}
})

export default store
