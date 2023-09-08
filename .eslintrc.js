module.exports = {
	root: true,
	env: {
		node: true,
		browser: true,
		es2021: true
	},
	extends: [
		'plugin:vue/essential',
		'@vue/airbnb',
		'plugin:prettier/recommended'
	],
	plugins: ['prettier'],
	parserOptions: {
		ecmaVersion: 12,
		sourceType: 'module'
	},
	globals: {
		google: true,
		__static: true
	},
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
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
