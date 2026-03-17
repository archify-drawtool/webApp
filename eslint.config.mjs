// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
    rules: {
        'no-console': 'warn',                   // prevents forgotten console.logs
        'no-unused-vars': 'error',              // houdt code schoon
        'vue/require-default-prop': 'error',    // betere component documentatie
    }}
)
