// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
    rules: {
        'no-console': 'warn',                   // prevents forgotten console.logs
        'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }], // keeps code clean, _ prefix = intentionally unused
        'vue/require-default-prop': 'error',    // better component documentation
        'vue/no-multiple-template-root': 'off'
    }}
)
