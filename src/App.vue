<template>
	<v-app>
		<v-main>
			<v-container v-if="!settings.autoLoad" style="margin-top: 100px">
				<v-card>
					<!-- eslint-disable-next-line no-irregular-whitespace -->
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
										v-model="settings.url"
										label="URL"
										hint="URL to load"
										:rules="[validUrl]"
										required
									></v-text-field>
								</v-col>

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
										row
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
									color="pink lighten-2"
									text
									@click="sendAction('clearCache')"
									>🗑️ Clear Cache</v-btn
								>
								<v-btn
									color="pink lighten-2"
									text
									@click="sendAction('clearStorage')"
									>🗑️ Clear Storage</v-btn
								>
							</v-col>
						</v-row>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn
							text
							outlined
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
					<atom-loader :value="true" />
				</div>
			</v-col>
			<v-snackbar
				v-model="snackbar.show"
				top
				:color="snackbar.color"
				timeout="2000"
			>
				{{ snackbar.text }}
				<template v-slot:action="{ attrs }">
					<v-btn text v-bind="attrs" @click="snackbar.show = false">
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
		settings: { autoReloadMode: 'every' },
		valid: true,
		snackbar: {
			show: false,
			text: null,
			color: 'info'
		},
		hours: new Array(24).fill(0).map((v, i) => ({
			text: `${i < 10 ? '0' : ''}${i}:00`,
			value: i
		}))
	}),
	computed: {
		store() {
			return window.store
		}
	},
	mounted() {
		window.ipc.on('action', action => {
			let text = ''
			const color = 'success'

			switch (action) {
				case 'clearCache':
					text = 'Cache cleared!'
					break
				case 'clearStorage':
					text = 'Storage cleared!'
					break
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

		if (this.settings.autoLoad) {
			this.checkUrl()
		}
	},
	methods: {
		parse,
		updateSettings() {
			if (this.$refs.form.validate()) {
				this.settings.autoLoad = true
				this.store.setSettings(this.settings)
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
				await fetch(this.settings.url, {
					mode: 'no-cors'
				})

				this.urlReady = true
				// redirect to url
				window.location.href = this.settings.url
			} catch (error) {
				// noop
			}

			if (!this.urlReady) {
				setTimeout(() => {
					this.checkUrl()
				}, 2000)
			}
		},
		async sendAction(action) {
			window.ipc.send('action', action)
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
				this.$vuetify.theme.dark = val.dark
			},
			deep: true
		}
	}
}
</script>
