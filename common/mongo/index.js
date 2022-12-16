import { startApp, stopApp } from './app.js'
import { startClient, stopClient} from './client.js'
import { startDao } from './dao.js'


let mongoDummy = null

process.on('warning', message => {
  startApp(message)
  stopApp (message)
  startClient(message)
  stopClient (message)
  startDao(message)
})



// export { mongoClient } from './client.js'
// export { DBApp, DBScheduler } from './dao.js'
// export { collUnits, collUsers, collAgents, collTasks } from './dao.js'

export { mongoDummy }
// export { createUnit, readUnit, readUnits, updateUnit } from './so.js'
// export { createUser, readUser, updateUser } from './so.js'
// export { createAgent, readAgent, readAgents, updateAgent } from './so.js'
