import { app, protocol, BrowserWindow, globalShortcut, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { join } from 'path'
import isDev from 'electron-is-dev'
import { platform } from 'os'
import store from './store'

const CACHE_INTERVAL = 3 * 1000
let reloadTimeout = null

// BrowserWindow instance
let win

/** UTILS */

/** Load main settings page */
async function loadMain() {
	if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		try {
			await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
			if (!process.env.IS_TEST) win.webContents.openDevTools()
		} catch (error) {
			if (error.code === 'ERR_ABORTED') {
				// ignore ERR_ABORTED error
			}
			throw error
		}
	} else {
		createProtocol('app')
		// Load the index.html when not in development
		await win.loadURL('app://./index.html')
	}
}

/** Create the KIOSK fullscreen window */
async function createWindow() {
	// Create the browser window.
	win = new BrowserWindow({
		width: 1200,
		height: 1000,
		fullscreen: !isDev,
		frame: isDev,
		autoHideMenuBar: true,
		kiosk: !isDev,
		icon: join(
			__static,
			platform() === 'win32' ? 'favicon.ico' : 'logo.png'
		),
		webPreferences: {
			preload: join(__dirname, 'preload.js'), // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/guide.html#preload-files

			// Use pluginOptions.nodeIntegration, leave this alone
			// See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration
			// for more info
			nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
			contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
			enableRemoteModule: true
		}
	})

	// FIX: https://github.com/innovation-system/electron-kiosk/issues/3
	win.webContents.on('render-process-gone', (event, detailed) => {
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

	await loadMain()
}

/** Periodic check of session cache, when limit is reached clear cache and reload page */
async function checkCache() {
	const actualCache = await win.webContents.session.getCacheSize()
	const limit = (store.get('settings.cacheLimit') || 500) * 1024 * 1024

	// console.log(`Actual cache is: ${actualCache / 1024 / 1024}`)
	// console.log(`Limit is: ${limit / 1024 / 1024}`)

	if (actualCache > limit) {
		await win.webContents.session.clearCache()
		await win.reload()
	}
}

/** When `settings.autoReload` is enabled schedule a reload to a specific hour */
function scheduleReload() {
	if (reloadTimeout) {
		clearTimeout(reloadTimeout)
		reloadTimeout = null
	}

	if (!store.get('settings.autoReload')) {
		return
	}

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
			win.reload()
			scheduleReload()
		},
		wait < 0 ? 0 : wait
	)
}

/** Setup store related events and listeners */
function setupStore() {
	setInterval(() => {
		checkCache()
	}, CACHE_INTERVAL)

	// watch for settings changes
	store.onDidChange('settings', () => {
		scheduleReload()
	})

	scheduleReload()
}

/** Global application shortcuts */
function registerShortcuts() {
	globalShortcut.register('CommandOrControl+Shift+I', () => {
		win.webContents.openDevTools()
	})

	globalShortcut.register('CommandOrControl+Shift+K', async () => {
		store.set('settings.autoLoad', false)
		loadMain().catch(err => {
			console.error(err)
		})
	})

	globalShortcut.register('CommandOrControl+Shift+L', () => {
		win.setKiosk(!win.isKiosk())
	})

	globalShortcut.register('CommandOrControl+Shift+R', () => {
		win.reload()
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
	ipcMain.on('action', async (event, action) => {
		try {
			switch (action) {
				case 'clearCache':
					await win.webContents.session.clearCache()
					break
				case 'clearStorage':
					await win.webContents.session.clearStorageData({
						storages: [
							'appcache',
							'cookies',
							'localstorage',
							'cachestorage'
						]
					})
					break
				default:
					break
			}
		} catch (error) {
			console.error(error)
		}
		event.reply('action', action)
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
		if (win) {
			if (win.isMinimized()) win.restore()
			win.focus()
		}
	})

	// Quit when all windows are closed.
	app.on('window-all-closed', () => {
		// On macOS it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q
		if (process.platform !== 'darwin') {
			app.quit()
		}
	})

	app.on('activate', () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})

	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	app.on('ready', async () => {
		if (isDev && !process.env.IS_TEST) {
			// Install Vue Devtools
			try {
				await installExtension(VUEJS_DEVTOOLS)
			} catch (e) {
				console.error('Vue Devtools failed to install:', e.toString())
			}
		}

		await createWindow()

		registerIpc()
		registerShortcuts()
		setupStore()
	})

	// Ignore certificates errors on page
	app.commandLine.appendSwitch('ignore-certificate-errors')
	app.commandLine.appendSwitch('allow-insecure-localhost', 'true')

	// Exit cleanly on request from parent process in development mode.
	if (isDev) {
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
