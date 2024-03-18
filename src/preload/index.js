import { contextBridge, ipcRenderer } from 'electron'
import store from '../store'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('ipc', {
	send: (channel, action, ...args) => {
		// whitelist channels
		const validChannels = ['action']
		if (validChannels.includes(channel)) {
			ipcRenderer.send(channel, action, ...args)
		}
	},
	on: (channel, func) => {
		const validChannels = ['action']
		if (validChannels.includes(channel)) {
			// Deliberately strip event as it includes `sender`
			ipcRenderer.on(channel, (event, ...args) => func(...args))
		}
	}
})

contextBridge.exposeInMainWorld('store', {
	settings() {
		return store.get('settings')
	},
	setSettings(settings) {
		store.set('settings', settings)
	}
})
