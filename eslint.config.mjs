// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
    rules: {
        'no-console': 'warn',                   // prevents forgotten console.logs
        'no-unused-vars': 'error',              // keeps code clean
        'vue/require-default-prop': 'error',    // beter component documentation
    }}
)
