import { mkdirSync, copyFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(
  root,
  'node_modules/@azure/msal-browser/lib/redirect-bridge/msal-redirect-bridge.min.js',
)
const destDir = join(root, 'public/auth')
const dest = join(destDir, 'msal-redirect-bridge.min.js')

mkdirSync(destDir, { recursive: true })
copyFileSync(src, dest)
console.log('Copied MSAL redirect bridge to public/auth/')
