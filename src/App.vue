<template>
	<v-app>
		<v-app-bar app color="primary" dark>
			<v-app-bar-title>Electron KIOSK</v-app-bar-title>
		</v-app-bar>

		<v-main>
			<v-container v-if="!settings.autoLoad">
				<v-card>
					<v-card-title> Settings </v-card-title>
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
						</v-form>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn color="primary" @click="updateSettings"
							>Update</v-btn
						>
					</v-card-actions>
				</v-card>
			</v-container>
			<v-col v-else align="center">
				<div class="text-h2 ma-5">Loading...</div>
				<v-progress-circular
					size="200"
					indeterminate
				></v-progress-circular>
			</v-col>
		</v-main>
	</v-app>
</template>

<script>
export default {
	name: 'App',

	components: {},

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
	computed: {},

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
	data: () => ({
		settings: {},
		valid: true
	})
}
</script>
