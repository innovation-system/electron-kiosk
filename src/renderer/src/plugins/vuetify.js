/* eslint-disable import/no-unresolved */
// src/plugins/vuetify.js
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import 'material-design-icons-iconfont/dist/material-design-icons.css' // Ensure you are using css-loader
import { aliases, md } from 'vuetify/iconsets/md'

export default createVuetify({
	icons: {
		defaultSet: 'md',
		aliases,
		sets: {
			md
		}
	}
})
