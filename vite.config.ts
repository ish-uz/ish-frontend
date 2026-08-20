import { defineConfig, loadEnv, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { buildFirebaseMessagingSw } from './src/lib/firebaseSw'

function writeMessagingSw(root: string, mode: string, outFile: string) {
  const env = loadEnv(mode, root, '')
  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, buildFirebaseMessagingSw(env))
}

function firebaseMessagingSwPlugin(): Plugin {
  let root = process.cwd()
  let mode = 'development'
  let outDir = 'dist'
  return {
    name: 'firebase-messaging-sw',
    configResolved(config) {
      root = config.root
      mode = config.mode
      outDir = config.build.outDir
      writeMessagingSw(root, mode, path.resolve(root, 'public/firebase-messaging-sw.js'))
    },
    configureServer() {
      writeMessagingSw(root, mode, path.resolve(root, 'public/firebase-messaging-sw.js'))
    },
    closeBundle() {
      writeMessagingSw(root, 'production', path.resolve(outDir, 'firebase-messaging-sw.js'))
    },
  }
}

export default defineConfig({
  plugins: [react(), firebaseMessagingSwPlugin()],
  assetsInclude: ['**/*.PNG'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
