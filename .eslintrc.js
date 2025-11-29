/* eslint-env node */

module.exports = {
    root: true,
    env: {
        browser: true,
        node: true
    },
    extends: ['@nuxtjs/eslint-config-typescript', 'plugin:prettier/recommended', 'plugin:nuxt/recommended'],
    parserOptions: {
        ecmaVersion: 'latest'
    },
    rules: {
        'space-before-function-paren': 0, // 函数定义时括号前面要有空格
        'no-console': 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-unused-vars': 'off'
    }
}
