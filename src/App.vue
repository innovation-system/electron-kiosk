<template>
	<v-app>
		<v-main>
			<v-container v-if="!settings.autoLoad">
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
								<v-switch
									v-model="settings.dark"
									inset
									persistent-hint
									class="ml-3"
								>
									<template v-slot:label>
										{{ settings.dark ? '🌙' : '☀️' }}
									</template>
								</v-switch>
							</v-row>
						</v-form>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn color="primary" @click="updateSettings">
							Update
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-container>
			<v-col v-else align="center">
				<div class="text-center">
					<atom-loader :value="true" />
				</div>
			</v-col>
		</v-main>
	</v-app>
</template>

<script>
import AtomLoader from './components/AtomLoader.vue'

export default {
	components: { AtomLoader },
	data: () => ({
		settings: {},
		valid: true
	}),
	mounted() {
		window.ipc.on('data', (event, message) => {
			console.log(message)
			console.log(event)
		})

		this.settings = window.store.settings()

		if (this.settings.autoLoad) {
			// make xmlhttprequest to the url and check response code to see if it's 200
			this.checkUrl()
		}
	},
	methods: {
		send() {
			window.ipc.send('data', 'hello')
		},
		updateSettings() {
			if (this.$refs.form.validate()) {
				this.settings.autoLoad = true
				window.store.setSettings(this.settings)
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
