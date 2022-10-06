<template>
	<v-app>
		<v-main>
			<v-container v-if="!settings.autoLoad" style="margin-top: 100px">
				<v-card>
					<v-card-title>Settings</v-card-title>
					<v-card-text>
						<v-form
							ref="form"
							v-model="valid"
							@submit.prevent="updateSettings"
						>
							<v-row>
								<v-col>
									<v-text-field
										v-model="settings.url"
										label="URL"
										:rules="[v => !!v || 'URL is required']"
										required
									></v-text-field>
								</v-col>
							</v-row>
							<v-row>
								<v-col>
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
							</v-row>
							<v-row>
								<v-col :cols="12" :sm="3">
									<v-switch
										v-model="settings.autoReload"
										inset
										label="Auto Reload"
										class="ml-3"
									>
									</v-switch>
								</v-col>
								<v-col :cols="12" :sm="5">
									<v-select
										v-show="settings.autoReload"
										v-model="settings.autoReloadHour"
										label="Hour"
										:items="hours"
									></v-select>
								</v-col>
							</v-row>
							<v-row justify="end" class="mr-2">
								<v-switch v-model="settings.dark" inset>
									<template v-slot:label>
										{{ settings.dark ? '🌙' : '☀️' }}
									</template>
								</v-switch>
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
						<v-btn color="primary" @click="updateSettings">
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
import AtomLoader from './components/AtomLoader.vue'
import { formatBytes } from './utils'

export default {
	components: { AtomLoader },
	data: () => ({
		settings: {},
		valid: true,
		snackbar: {
			show: false,
			text: null,
			color: 'info'
		},
		hours: []
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
					break
			}

			this.snackbar = {
				show: true,
				text,
				color
			}
			// console.log(event)
		})

		this.settings = this.store.settings()

		if (this.settings.autoLoad) {
			// make xmlhttprequest to the url and check response code to see if it's 200
			this.checkUrl()
		}

		// Add hours
		for (let i = 0; i < 24; i++) {
			this.hours.push({ text: `${i < 10 ? '0' : ''}${i}:00`, value: i })
		}
	},
	methods: {
		formatBytes,
		updateSettings() {
			if (this.$refs.form.validate()) {
				this.settings.autoLoad = true
				this.store.setSettings(this.settings)
				console.log(this.settings)
				this.checkUrl()
			}
		},
		async checkUrl() {
			try {
				const response = await fetch(this.settings.url)
				this.urlReady = response.status === 200

				if (this.urlReady) {
					// redirect to url
					window.location.href = this.settings.url
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
		async sendAction(action) {
			window.ipc.send('action', action)
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
