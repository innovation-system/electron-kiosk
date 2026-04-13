<template>
	<v-app>
		<v-main>
			<v-container v-if="!settings.autoLoad" style="margin-top: 100px">
				<v-card>
					<!-- eslint-disable-next-line vue/no-irregular-whitespace -->
					<v-card-title>⚙️ Settings​</v-card-title>
					<v-card-text>
						<v-form
							ref="form"
							v-model="valid"
							@submit.prevent="updateSettings"
						>
							<v-row>
								<v-col :cols="12" :sm="6">
									<v-text-field
										v-if="!settings.multipleDisplays"
										v-model="settings.url"
										label="URL"
										hint="URL to load"
										:rules="[validUrl]"
										required
									></v-text-field>
								</v-col>

								<v-col :cols="12" :sm="6">
									<v-switch
										color="primary"
										v-model="settings.multipleDisplays"
										inset
										label="Multiple displays"
										persistent-hint
										hint="Enable this to spawn multiple windows with different urls on different displays"
										class="ml-3"
									>
									</v-switch>
								</v-col>

								<!-- Custom Resolution for Single Display -->
								<v-col
									v-if="!settings.multipleDisplays"
									:cols="12"
									:sm="6"
								>
									<v-switch
										color="primary"
										v-model="settings.useCustomResolution"
										inset
										label="Custom Resolution"
										persistent-hint
										hint="Simulate a specific resolution (e.g., 1024x768)"
										class="ml-3"
									>
									</v-switch>
								</v-col>

								<v-col
									v-show="!settings.multipleDisplays && settings.useCustomResolution"
									:cols="12"
									:sm="3"
								>
									<v-text-field
										v-model.number="settings.customWidth"
										type="number"
										label="Width"
										hint="Resolution width in pixels"
										persistent-hint
										suffix="px"
										min="320"
										:rules="[
											v => !!v || 'Width is required',
											v => v >= 320 || 'Minimum width is 320px'
										]"
										
										required
									>
									</v-text-field>
								</v-col>

								<v-col
									v-show="!settings.multipleDisplays && settings.useCustomResolution"
									:cols="12"
									:sm="3"
								>
									<v-text-field
										v-model.number="settings.customHeight"
										type="number"
										label="Height"
										hint="Resolution height in pixels"
										persistent-hint
										suffix="px"
										min="240"
										:rules="[
											v => !!v || 'Height is required',
											v => v >= 240 || 'Minimum height is 240px'
										]"
										
										required
									>
									</v-text-field>
								</v-col>

								<v-col
									v-show="!settings.multipleDisplays && settings.useCustomResolution"
									:cols="12"
									:sm="6"
								>
									<v-select
										v-model="settings.customPosition"
										:items="positionOptions"
										label="Position"
										hint="Where to position the viewport on screen"
										persistent-hint
										item-title="label"
										item-value="value"
									>
									</v-select>
								</v-col>

								<v-col
									v-if="settings.multipleDisplays"
									:cols="12"
								>
									<h3 class="mb-3">Displays</h3>

									<v-row
										v-for="(
											display, index
										) in settings.displays"
										:key="index"
									>
										<v-col :cols="12" :sm="6">
											<v-select
												v-model="display.id"
												:items="displays"
												label="Display"
												hint="The display to use"
												item-title="label"
												item-value="id"
												:rules="[
													required,
													validDisplay
												]"
												required
											/>
										</v-col>
										<v-col :cols="12" :sm="6">
											<v-text-field
												v-model="display.url"
												label="Url"
												hint="The url to open on selected display"
												:rules="[validUrl]"
												required
											>
												<template v-slot:append>
													<v-btn
														icon
														size="x-small"
														color="error"
														@click="
															settings.displays.splice(
																index,
																1
															)
														"
													>
														<strong>X</strong>
													</v-btn>
												</template>
											</v-text-field>
										</v-col>
										
										<!-- Custom Resolution per Display -->
										<v-col :cols="12" :sm="4">
											<v-switch
												color="primary"
												v-model="display.useCustomResolution"
												inset
												label="Custom Resolution"
												persistent-hint
												hint="Enable custom resolution for this display"
												class="ml-3"
											>
											</v-switch>
										</v-col>

										<v-col
											v-show="display.useCustomResolution"
											:cols="12"
											:sm="3"
										>
											<v-text-field
												v-model.number="display.customWidth"
												type="number"
												label="Width"
												hint="Resolution width in pixels"
												persistent-hint
												suffix="px"
												min="320"
												:rules="[
													v => !!v || 'Width is required',
													v => v >= 320 || 'Minimum width is 320px'
												]"
												
												required
											>
											</v-text-field>
										</v-col>

										<v-col
											v-show="display.useCustomResolution"
											:cols="12"
											:sm="3"
										>
											<v-text-field
												v-model.number="display.customHeight"
												type="number"
												label="Height"
												hint="Resolution height in pixels"
												persistent-hint
												suffix="px"
												min="240"
												:rules="[
													v => !!v || 'Height is required',
													v => v >= 240 || 'Minimum height is 240px'
												]"
												
												required
											>
											</v-text-field>
										</v-col>

										<v-col
											v-show="display.useCustomResolution"
											:cols="12"
											:sm="2"
										>
											<v-select
												v-model="display.customPosition"
												:items="positionOptions"
												label="Position"
												hint="Where to position the viewport on screen"
												persistent-hint
												item-title="label"
												item-value="value"
											>
											</v-select>
										</v-col>

										<!-- Divider between displays -->
										<v-col v-if="index < settings.displays.length - 1" :cols="12">
											<v-divider class="my-2"></v-divider>
										</v-col>
									</v-row>
									<div class="d-flex">
										<v-btn
											class="mx-auto"
											color="primary"
											v-if="
												settings.displays.length <
												displays.length
											"
											@click="
												settings.displays.push({
													id: '',
													url: '',
													useCustomResolution: false,
													customWidth: 1920,
													customHeight: 1080,
													customPosition: 'top-left'
												})
											"
										>
											<strong>+</strong> Add display
										</v-btn>
									</div>
								</v-col>

								<v-divider></v-divider>

								<v-col :cols="12" :sm="6">
									<v-text-field
										v-model.number="settings.cacheLimit"
										type="number"
										label="Cache Limit"
										hint="When cache reaches this size clear and reload page"
										persistent-hint
										suffix="MB"
										min="1"
										:rules="[
											v => !!v || 'Limit is required'
										]"
										required
									>
									</v-text-field>
								</v-col>

								<v-col :cols="12" :sm="3">
									<v-switch
										color="primary"
										v-model="settings.autoReload"
										inset
										label="Scheduled Reload"
										class="ml-3"
									>
									</v-switch>
								</v-col>
								<v-col :cols="12" :sm="3">
									<v-radio-group
										v-if="settings.autoReload"
										v-model="settings.autoReloadMode"
										label="Mode"
									>
										<v-radio
											label="Every"
											value="every"
										></v-radio>
										<v-radio
											label="Hour"
											value="hour"
										></v-radio>
									</v-radio-group>
								</v-col>
								<v-col
									:cols="12"
									:sm="6"
									v-if="settings.autoReloadMode === 'every'"
								>
									<v-text-field
										:disabled="!settings.autoReload"
										v-model="settings.autoReloadEvery"
										label="Every"
										hint="Reload page every (string duration). Ex: 30s"
										persistent-hint
										clearable
										:rules="[validateDuration]"
										required
									></v-text-field>
								</v-col>
								<v-col :cols="12" :sm="6" v-else>
									<v-select
										:disabled="!settings.autoReload"
										v-model="settings.autoReloadHour"
										persistent-hint
										hint="Reload page exactly at this hour"
										label="Hour"
										:items="hours"
									></v-select>
								</v-col>
								<v-col :cols="12" :sm="6">
									<v-switch
										color="primary"
										v-model="settings.dark"
										inset
										label="Theme"
										class="ml-3"
									>
										<template v-slot:label>
											{{ settings.dark ? '🌙' : '☀️' }}
										</template>
									</v-switch>
								</v-col>
							</v-row>
						</v-form>
						<v-divider class="my-4"></v-divider>
						<v-row>
							<v-col>
								<v-btn
									color="pink-lighten-2"
									variant="text"
									@click="sendAction('clearCache')"
									>🗑️ Clear Cache</v-btn
								>
								<v-btn
									color="pink-lighten-2"
									variant="text"
									@click="sendAction('clearStorage')"
									>🗑️ Clear Storage</v-btn
								>
							</v-col>
						</v-row>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn
							variant="text"
							:disabled="!valid"
							color="primary"
							@click="updateSettings"
						>
							✏️ Update
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-container>
			<v-col v-else align="center">
				<div class="text-center">
					<atom-loader :modelValue="true" />
				</div>
			</v-col>
			<v-snackbar
				v-model="snackbar.show"
				location="top"
				:color="snackbar.color"
				timeout="2000"
			>
				{{ snackbar.text }}
				<template v-slot:action="{ attrs }">
					<v-btn
						variant="text"
						v-bind="attrs"
						@click="snackbar.show = false"
					>
						Close
					</v-btn>
				</template>
			</v-snackbar>
		</v-main>
	</v-app>
</template>

<script>
import parse from 'parse-duration'
import AtomLoader from './components/AtomLoader.vue'

export default {
	components: { AtomLoader },
	data: () => ({
		displayId: '',
		settings: { autoReloadMode: 'every' },
		displays: [],
		valid: true,
		snackbar: {
			show: false,
			text: null,
			color: 'info'
		},
		hours: new Array(24).fill(0).map((v, i) => ({
			title: `${i < 10 ? '0' : ''}${i}:00`,
			value: i
		})),
		positionOptions: [
			{ label: 'Top Left', value: 'top-left' },
			{ label: 'Top Center', value: 'top-center' },
			{ label: 'Top Right', value: 'top-right' },
			{ label: 'Center Left', value: 'center-left' },
			{ label: 'Center', value: 'center' },
			{ label: 'Center Right', value: 'center-right' },
			{ label: 'Bottom Left', value: 'bottom-left' },
			{ label: 'Bottom Center', value: 'bottom-center' },
			{ label: 'Bottom Right', value: 'bottom-right' }
		],
		required: v => v != null || 'This is required'
	}),
	computed: {
		store() {
			return window.store
		}
	},
	mounted() {
		const urlParams = new URLSearchParams(window.location.search)
		this.displayId = parseInt(urlParams.get('displayId') ?? 0, 10)

		window.ipc.on('action', (action, data) => {
			let text = ''
			const color = 'success'

			switch (action) {
				case 'clearCache':
					text = 'Cache cleared!'
					break
				case 'clearStorage':
					text = 'Storage cleared!'
					break
				case 'settingsUpdated':
					text = 'Settings updated!'
					break
				case 'getDisplays':
					this.displays = data
					return

				default:
					text = `Unknown action ${action}`
					break
			}

			this.snackbar = {
				show: true,
				text,
				color
			}
		})

		this.settings = this.store.settings()
		this.sendAction('getDisplays')

		if (this.settings.autoLoad) {
			this.checkUrl()
		}
	},

	methods: {
		parse,
		validDisplay(id) {
			if (!this.displays.find(d => d.id === id)) {
				return 'Invalid display'
			}
			if (this.settings.displays.filter(d => d.id === id).length > 1) {
				return 'Duplicate display'
			}

			return true
		},
		updateSettings() {
			if (this.$refs.form.validate()) {
				this.settings.autoLoad = true
				const oldSettings = this.store.settings()
				const newSettings = JSON.parse(JSON.stringify(this.settings))
				this.store.setSettings(newSettings)
				this.sendAction('settingsUpdated', newSettings, oldSettings)
				this.checkUrl()
			}
		},
		validUrl(url) {
			try {
				const parsed = new URL(url)
				return (
					parsed.protocol === 'http:' ||
					parsed.protocol === 'https:' ||
					'Invalid URL'
				)
			} catch (e) {
				return 'Invalid URL'
			}
		},
		async checkUrl() {
			try {
				const url = this.displayId
					? this.settings.displays.find(d => d.id === this.displayId)
							?.url
					: this.settings.url

				if (!url) {
					this.snackbar = {
						show: true,
						text: 'No URL to load found',
						color: 'error'
					}
					return
				}
				// check if url is reachable
				await fetch(url, {
					method: 'HEAD'
				})

				this.urlReady = true
				
				// Check if custom resolution is enabled
				let useCustomResolution = false
				let customWidth = 1920
				let customHeight = 1080
				let customPosition = 'top-left'

				if (this.displayId) {
					// Get settings for this specific display
					const displaySetting = this.settings.displays.find(
						d => d.id === this.displayId
					)
					if (displaySetting) {
						useCustomResolution = displaySetting.useCustomResolution || false
						customWidth = displaySetting.customWidth || 1920
						customHeight = displaySetting.customHeight || 1080
						customPosition = displaySetting.customPosition || 'top-left'
					}
				} else {
					// Get global settings
					useCustomResolution = this.settings.useCustomResolution || false
					customWidth = this.settings.customWidth || 1920
					customHeight = this.settings.customHeight || 1080
					customPosition = this.settings.customPosition || 'top-left'
				}

				// Redirect to viewport wrapper or directly to URL
				if (useCustomResolution) {
					const viewportUrl = `viewport.html?url=${encodeURIComponent(url)}&width=${customWidth}&height=${customHeight}&position=${customPosition}`
					window.location.href = viewportUrl
				} else {
					window.location.href = url
				}
			} catch (error) {
				// noop
			}

			if (!this.urlReady) {
				setTimeout(() => {
					this.checkUrl()
				}, 2000)
			}
		},
		async sendAction(action, ...args) {
			window.ipc.send('action', action, ...args)
		},
		isNumber(value, coerce = false) {
			if (coerce) {
				value = Number(value)
			}
			return typeof value === 'number' && Number.isFinite(value)
		},
		validateDuration(v) {
			const parsed = parse(v)
			return this.isNumber(parsed) || 'Invalid duration'
		}
	},
	watch: {
		settings: {
			handler(val) {
				this.$vuetify.theme.global.name = val.dark ? 'dark' : 'light'
			},
			deep: true
		}
	}
}
</script>
