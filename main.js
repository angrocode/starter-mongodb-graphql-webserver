import { emitWarning } from 'node:process'
import { mongoDummy } from './common/mongo/index.js'
import { webDummy } from './common/server/index.js'

import { waiting, processExit } from './common/utils.js'




;['SIGINT', 'SIGHUP', 'SIGQUIT', 'SIGKILL', 'SIGUSR2', 'SIGTERM', 'SIGSTOP'].forEach(name => {
  process.on(name, (signal, code) => {
    stopProject(name, code)
    return signal
  })
})

// https://gist.github.com/jproulx/133c6094a444b0f32fd4

// ;['exit', 'uncaughtException', 'unhandledRejection'].forEach(name => {
//   process.on(name, code => {
//     stopProject(name, code)
//     return code
//   })
// })

startProject()

// await waiting(15_000)
// processExit()

//  ====================================

function startProject() {
  emitWarning('StartProject', {
    type: 'Start/Stop Event',
    code: 'StartProject',
    detail: 'получен сигнал запуска проекта',
  })
}

function stopProject(name, code) {
  emitWarning('StopProject', {
    type: 'Start/Stop Event',
    code: 'StopProject',
    detail: `получен сигнал остановки проекта '${name}' с кодом '${code}'`,
  })
}
