import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const vitePath = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url))
const api = spawn(process.execPath, ['server/index.js'], { stdio: 'inherit' })
const vite = spawn(process.execPath, [vitePath], { stdio: 'inherit' })
let shuttingDown = false

function shutdown(signal = 'SIGTERM') {
  if (shuttingDown) return
  shuttingDown = true
  api.kill(signal)
  vite.kill(signal)
}

api.on('exit', (code) => {
  if (!shuttingDown && code !== 0) shutdown()
})
vite.on('exit', (code) => {
  if (!shuttingDown && code !== 0) shutdown()
})
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
