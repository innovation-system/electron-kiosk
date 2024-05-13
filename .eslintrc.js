module.exports = {
	root: true,
	env: {
		node: true,
		browser: true,
		es2021: true
	},
	extends: [
		'plugin:vue/essential',
		'plugin:vuetify/base',
		'@vue/airbnb',
		'plugin:prettier/recommended'
	],
	plugins: ['prettier'],
	parserOptions: {
		ecmaVersion: 15,
		sourceType: 'module'
	},
	globals: {
		__static: true
	},
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-await-in-loop': 'off',
		'import/no-extraneous-dependencies': 'off',
		'no-underscore-dangle': 'off',
		'no-param-reassign': 'off',
		'no-restricted-syntax': 'off',
		'guard-for-in': 'off',
		'no-plusplus': 'off',
		'class-methods-use-this': 'off',
		'no-useless-constructor': 'off',
		'no-new-func': 'off',
		'dot-notation': 'off',
		'no-restricted-globals': ['error', 'isFinite', 'isNaN'],
		'vue/experimental-script-setup-vars': 'off',
		'vue/script-setup-uses-vars': 'off'
	}
}
