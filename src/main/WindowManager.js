import { is } from '@electron-toolkit/utils'
import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import store from '../store'
// eslint-disable-next-line import/no-unresolved
// eslint-disable-next-line import/no-unresolved

/**
 * Custom BrowserWindow class that is used to spawn a window
 * on each display connected to the computer (based on settings).
 * When a method is called on this class, it will be called on all windows
 */
export default class WindowManager {
	/**
	 * @type { BrowserWindow[] }
	 */
	windows = []

	/**
	 * @type { import('electron').BrowserViewConstructorOptions }
	 * */
	options = {}

	/** @param { import('electron').BrowserViewConstructorOptions } options */
	constructor(options) {
		this.options = options

		// Create a window for each display
		const displays = screen.getAllDisplays()

		const multipleDisplays = store.get('settings.multipleDisplays')
		if (!multipleDisplays) {
			this.windows.push(
				new BrowserWindow({
					...options
				})
			)
			return
		}

		const displaySettings = store.get('settings.displays')

		for (const setting of displaySettings) {
			const { id } = setting
			const display = displays.find(d => d.id === id)
			if (!display) {
				console.warn(`Display with id ${id} not found`)
				// eslint-disable-next-line no-continue
				continue
			}

			const window = new BrowserWindow({
				...options,
				x: display.bounds.x,
				y: display.bounds.y
				// width: display.workArea.width,
				// height: display.workArea.height
			})

			window.displayId = id

			this.windows.push(window)
		}
	}

	loadMain() {
		for (const window of this.windows) {
			const idQuery =
				window.displayId !== undefined
					? `?displayId=${window.displayId}`
					: ''
			// Fixes error https://github.com/electron/electron/issues/19847
			try {
				// example from https://github.com/alex8088/electron-vite-boilerplate/blob/master/electron.vite.config.ts
				if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
					window.loadURL(
						process.env['ELECTRON_RENDERER_URL'] + idQuery
					)
				} else {
					window.loadFile(
						join(__dirname, '../renderer/index.html') + idQuery
					)
				}
			} catch (error) {
				console.error('Error while loading url', error)
				if (error.code === 'ERR_ABORTED') {
					// ignore ERR_ABORTED error
				} else {
					store.set('settings.autoLoad', false)
					this.loadMain()
				}
			}
		}
	}

	/** @param {string} url */
	loadURL(url) {
		for (const window of this.windows) {
			window.loadURL(url)
		}
	}

	/** @param {string} file */
	loadFile(file) {
		for (const window of this.windows) {
			window.loadFile(file)
		}
	}

	reload() {
		for (const window of this.windows) {
			window.reload()
		}
	}

	/** @param {boolean} kiosk */
	setKiosk(kiosk) {
		for (const window of this.windows) {
			window.setKiosk(kiosk)
		}
	}

	toggleKiosk() {
		for (const window of this.windows) {
			window.setKiosk(!window.isKiosk())
		}
	}

	focus() {
		for (const window of this.windows) {
			if (window.isMinimized()) window.restore()
			window.focus()
		}
	}

	/**
	 *
	 * @param {string} event
	 * @param { Function } listener
	 * @memberof WindowManager
	 */
	attachWebContentEvent(event, listener) {
		for (const window of this.windows) {
			window.webContents.on(event, listener)
		}
	}

	/**
	 * @param {Function} listener
	 * @memberof WindowManager
	 */
	onBeforeSendHeaders(listener) {
		for (const window of this.windows) {
			window.webContents.session.webRequest.onBeforeSendHeaders(listener)
		}
	}

	/**
	 * @param {Function} listener
	 * @memberof WindowManager
	 */
	onHeadersReceived(listener) {
		for (const window of this.windows) {
			window.webContents.session.webRequest.onHeadersReceived(listener)
		}
	}

	async checkCache() {
		for (const window of this.windows) {
			const actualCache = await window.webContents.session.getCacheSize()
			const limit =
				(store.get('settings.cacheLimit') || 500) * 1024 * 1024

			// console.log(`Actual cache is: ${actualCache / 1024 / 1024}`)
			// console.log(`Limit is: ${limit / 1024 / 1024}`)

			if (actualCache > limit) {
				await window.webContents.session.clearCache()
				window.reload()
			}
		}
	}

	openDevTools() {
		for (const window of this.windows) {
			window.webContents.openDevTools()
		}
	}

	async clearCache() {
		for (const window of this.windows) {
			await window.webContents.session.clearCache()
		}
	}

	async clearStorageData() {
		for (const window of this.windows) {
			await window.webContents.session.clearStorageData({
				storages: [
					'appcache',
					'cookies',
					'localstorage',
					'cachestorage'
				]
			})
		}
	}

	destroy() {
		for (const window of this.windows) {
			window.destroy()
		}
	}
}
