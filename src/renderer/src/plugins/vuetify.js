// src/plugins/vuetify.js
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'material-design-icons-iconfont/dist/material-design-icons.css' // Ensure you are using css-loader
import { md } from 'vuetify/iconsets/md'

export default createVuetify({
	components,
	directives,
	icons: {
		defaultSet: 'md',
		sets: {
			md
		}
	}
})
