import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import {
	BrowserWindow,
	app,
	globalShortcut,
	ipcMain,
	protocol,
	screen
} from 'electron'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { platform } from 'os'
import parse from 'parse-duration'
import { join } from 'path'
import store from '../store'
// eslint-disable-next-line import/no-unresolved
import icon from '../../resources/logo.png?asset'
// eslint-disable-next-line import/no-unresolved
import iconWin from '../../resources/favicon.ico?asset'
import WindowManager from './WindowManager'

const CACHE_INTERVAL = 3 * 1000
let reloadTimeout = null
let restarting = false

// fixes https://github.com/electron/electron/issues/19775
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

/** @type { WindowManager } */
let manager

/** UTILS */

function UpsertKeyValue(obj, keyToChange, value) {
	const keyToChangeLower = keyToChange.toLowerCase()
	for (const key of Object.keys(obj)) {
		if (key.toLowerCase() === keyToChangeLower) {
			// Reassign old key
			obj[key] = value
			// Done
			return
		}
	}
	// Insert at end instead
	obj[keyToChange] = value
}

/** Create the KIOSK fullscreen window */
function setupWindowsManager() {
	// Create the browser window.
	manager = new WindowManager({
		width: 1200,
		height: 1000,
		fullscreen: !is.dev,
		frame: is.dev,
		autoHideMenuBar: true,
		kiosk: !is.dev,
		icon: platform() === 'win32' ? iconWin : icon,
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'), // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/guide.html#preload-files
			sandbox: false,
			// Use pluginOptions.nodeIntegration, leave this alone
			// See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration
			// for more info
			nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
			contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
			enableRemoteModule: true
		}
	})

	// FIX: https://github.com/innovation-system/electron-kiosk/issues/3
	manager.attachWebContentEvent('render-process-gone', (event, detailed) => {
		console.log(
			`!crashed, reason: ${detailed.reason}, exitCode = ${detailed.exitCode}`
		)
		if (detailed.reason === 'crashed') {
			// relaunch app
			app.relaunch({
				args: process.argv.slice(1).concat(['--relaunch'])
			})
			app.exit(0)
		}
	})

	// FIX CORS ERROR: https://pratikpc.medium.com/bypassing-cors-with-electron-ab7eaf331605
	manager.onBeforeSendHeaders((details, callback) => {
		const { requestHeaders } = details
		UpsertKeyValue(requestHeaders, 'Access-Control-Allow-Origin', ['*'])
		callback({ requestHeaders })
	})

	manager.onHeadersReceived((details, callback) => {
		const { responseHeaders } = details
		UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Origin', ['*'])
		UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Headers', ['*'])
		callback({
			responseHeaders
		})
	})

	manager.loadMain()
}

/** When `settings.autoReload` is enabled schedule a reload to a specific hour or every tot ms */
function scheduleReload() {
	if (reloadTimeout) {
		clearTimeout(reloadTimeout)
		reloadTimeout = null
	}

	if (!store.get('settings.autoReload')) {
		return
	}

	const mode = store.get('settings.autoReloadMode')

	if (mode === 'hour') {
		const now = new Date()
		let start

		const reloadHour = store.get('settings.autoReloadHour') || 0

		if (now.getHours() < reloadHour) {
			start = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
				reloadHour,
				0,
				0,
				0
			)
		} else {
			start = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate() + 1,
				reloadHour,
				0,
				0,
				0
			)
		}

		const wait = start.getTime() - now.getTime()

		reloadTimeout = setTimeout(
			() => {
				if (reloadTimeout) {
					clearTimeout(reloadTimeout)
					reloadTimeout = null
				}
				manager.reload()
				scheduleReload()
			},
			wait < 0 ? 0 : wait
		)
	} else if (mode === 'every') {
		const reloadEvery = store.get('settings.autoReloadEvery') || '1h30m'
		const ms = parse(reloadEvery)
		reloadTimeout = setTimeout(() => {
			if (reloadTimeout) {
				clearTimeout(reloadTimeout)
				reloadTimeout = null
			}
			manager.reload()
			scheduleReload()
		}, ms)
	}
}

function onSettingsChanged(newSettings, oldSettings) {
	scheduleReload()

	if (newSettings.multipleDisplays) {
		// check if settings.displays changed
		const changed =
			oldSettings.multipleDisplays !== newSettings.multipleDisplays ||
			oldSettings.displays.length !== newSettings.displays.length ||
			oldSettings.displays.some(
				(display, index) =>
					display.id !== newSettings.displays[index].id ||
					display.url !== newSettings.displays[index].url
			)

		if (changed) {
			restarting = true
			manager.destroy()
			setupWindowsManager()
			restarting = false
		} else {
			manager.loadMain()
		}
	}
}

/** Setup store related events and listeners */
function setupStore() {
	setInterval(() => {
		manager.checkCache()
	}, CACHE_INTERVAL)

	// watch for settings changes
	// store.onDidChange('settings', (newValue, oldValue) => {
	// 	onSettingsChanged(newValue, oldValue)
	// })

	scheduleReload()
}

/** Global application shortcuts */
function registerShortcuts() {
	globalShortcut.register('CommandOrControl+Shift+I', () => {
		manager.openDevTools()
	})

	globalShortcut.register('CommandOrControl+Shift+K', async () => {
		store.set('settings.autoLoad', false)
		manager.loadMain()
	})

	globalShortcut.register('CommandOrControl+Shift+L', () => {
		manager.toggleKiosk()
	})

	globalShortcut.register('CommandOrControl+Shift+R', () => {
		manager.reload()
	})

	globalShortcut.register('CommandOrControl+Shift+Q', () => {
		app.quit()
	})

	// globalShortcut.register('CommandOrControl+Shift+H', () => {
	// 	win.hide()
	// })

	// globalShortcut.register('CommandOrControl+Shift+S', () => {
	// 	win.show()
	// })

	// globalShortcut.register('CommandOrControl+Shift+M', () => {
	// 	win.minimize()
	// })

	// globalShortcut.register('CommandOrControl+Shift+U', () => {
	// 	win.maximize()
	// })

	// globalShortcut.register('CommandOrControl+Shift+D', () => {
	// 	win.unmaximize()
	// })

	// globalShortcut.register('CommandOrControl+Shift+F', () => {
	// 	win.setFullScreen(!win.isFullScreen())
	// })
}

/** Register to IPC releated events */
function registerIpc() {
	ipcMain.on('action', async (event, action, ...args) => {
		let data = null
		try {
			switch (action) {
				case 'clearCache':
					await manager.clearCache()
					break
				case 'clearStorage':
					await manager.clearStorageData({
						storages: [
							'appcache',
							'cookies',
							'localstorage',
							'cachestorage'
						]
					})
					break
				case 'getDisplays':
					data = screen.getAllDisplays().map(display => {
						return {
							id: display.id,
							label: display.label
						}
					})
					break
				case 'settingsUpdated':
					onSettingsChanged(...args)
					break
				default:
					break
			}
		} catch (error) {
			console.error(error)
		}
		event.reply('action', action, data)
	})
}

/** APP SETUP */

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
	{ scheme: 'app', privileges: { secure: true, standard: true } }
])

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
	app.quit()
} else {
	// When another instance is started, focus the already running instance
	app.on('second-instance', () => {
		// Someone tried to run a second instance, we should focus our window.
		if (manager) {
			manager.focus()
		}
	})

	// Quit when all windows are closed.
	app.on('window-all-closed', () => {
		// On macOS it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q
		if (process.platform !== 'darwin' && !restarting) {
			app.quit()
		}
	})

	app.on('activate', () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) setupWindowsManager()
	})

	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	app.on('ready', async () => {
		// Set app user model id for windows
		electronApp.setAppUserModelId('com.electron-kiosk')

		if (is.dev && !process.env.IS_TEST) {
			// Install Vue Devtools
			try {
				await installExtension(VUEJS_DEVTOOLS)
			} catch (e) {
				console.error('Vue Devtools failed to install:', e.toString())
			}
		}

		// Default open or close DevTools by F12 in development
		// and ignore CommandOrControl + R in production.
		// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
		app.on('browser-window-created', (_, window) => {
			optimizer.watchWindowShortcuts(window)
		})

		registerShortcuts()
		registerIpc()
		setupStore()
		setupWindowsManager()
	})

	// Ignore certificates errors on page
	app.commandLine.appendSwitch('ignore-certificate-errors')
	app.commandLine.appendSwitch('allow-insecure-localhost', 'true')

	// Exit cleanly on request from parent process in development mode.
	if (is.dev) {
		if (process.platform === 'win32') {
			process.on('message', data => {
				if (data === 'graceful-exit') {
					app.quit()
				}
			})
		} else {
			process.on('SIGTERM', () => {
				app.quit()
			})
		}
	}
}

process.on('uncaughtException', (error, origin) => {
	console.error('Uncaught Exception at:', origin, 'error:', error)
})

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})
