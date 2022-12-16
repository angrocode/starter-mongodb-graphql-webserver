import { startWeb, stopWeb } from './server.js'


let webDummy = null

process.on('warning', message => {
  startWeb(message)
  stopWeb (message)
})

export { webDummy }