import { platform } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { emitWarning } from 'node:process'
import { isObject } from '../utils.js'
import { mongoConfig } from '../../config.js'


let mongoApp = null

export { startApp, stopApp }

let countFlags = 0
function startApp(message) {

  const startFlags = ['StartProject']

  if (startFlags.includes(message.code)) countFlags++

  if (startFlags.length == countFlags && mongoConfig.loading) {
    countFlags = 0
    app()
  }

  if (startFlags.length == countFlags && !mongoConfig.loading) {
    countFlags = 0
    emitWarning('MongoAppRun', {
      type: 'Start/Stop Event',
      code: 'MongoAppRun',
      detail: '! процесс mongo внешний !',
    })
  }

}

function stopApp(message) {

  if (message.code == 'MongoClientClosed' && mongoApp) mongoApp.kill('SIGINT')

}

function app() {

  if (!      isObject(mongoConfig)) throw new Error('mongoConfig должен быть объектом')
  if (!('loading'  in mongoConfig)) throw new Error('mongoConfig должен содержать loading')
  if (!('pathDb'   in mongoConfig)) throw new Error('mongoConfig должен содержать pathDb')
  if (!('pathDbms' in mongoConfig)) throw new Error('mongoConfig должен содержать pathDbms')

  if (mongoConfig.loading) {

    const {pathDb, pathDbms: _pathDbms, port} = mongoConfig

    const pathDbms = platform() === 'win32' ? join(_pathDbms, 'mongod.exe') : join(_pathDbms, 'mongod')

    mongoApp = spawn(pathDbms, [`--dbpath=${join(pathDb)}`, `--port=${port}`])

    mongoApp.on('spawn', () => {
      emitWarning('MongoAppRun', {
        type: 'Start/Stop Event',
        code: 'MongoAppRun',
        detail: 'процесс mongo запущен',
      })
    })

    mongoApp.on('close', () => {
      emitWarning('MongoAppStop', {
        type: 'Start/Stop Event',
        code: 'MongoAppStop',
        detail: 'процесс mongo остановлен',
      })
    })

    mongoApp.stderr.on('data', data => {
      console.log(`процесс mongo ошибка ${data}`)
    })

  }

}
