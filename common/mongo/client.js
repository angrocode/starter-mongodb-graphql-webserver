import { emitWarning } from 'node:process'
import * as mongodb from 'mongodb'
import { isObject } from '../utils.js'
import { mongoConfig } from '../../config.js'


let mongoClient = null

export { mongoClient, mongodb }
export { startClient, stopClient }

let countFlags = 0
function startClient(message) {

  const startFlags = ['MongoAppRun']

  if (startFlags.includes(message.code)) countFlags++
  if (startFlags.length == countFlags ) { countFlags = 0; client() }

}

function stopClient(message) {

  let webServerOpen = false

  if (message.code == 'WebServerOpen') webServerOpen = true
  if (message.code == 'WebServerClosed' && mongoClient) mongoClient.close()
  if (message.code == 'StopProject' && !webServerOpen && mongoClient) mongoClient.close()

}

function client() {

  if (!  isObject(mongoConfig)) throw new Error('mongoConfig должен быть объектом')
  if (!('host' in mongoConfig)) throw new Error('mongoConfig должен содержать host')
  if (!('port' in mongoConfig)) throw new Error('mongoConfig должен содержать port')

  mongoClient = new mongodb.MongoClient(`mongodb://${mongoConfig.host}:${mongoConfig.port}`) 

  mongoClient.db('local').command({ping: 1}).then() // без этого не поднимуться соединения, событий не будет

  // https://www.mongodb.com/docs/drivers/node/current/fundamentals/monitoring/cluster-monitoring/

  mongoClient.once('serverHeartbeatSucceeded', () => {
    emitWarning('MongoClientOpen', {
      type: 'Start/Stop Event',
      code: 'MongoClientOpen',
      detail: 'клиент mongo установил соединения',
    })
  })

  mongoClient.once('topologyClosed', () => {
    emitWarning('MongoClientClosed', {
      type: 'Start/Stop Event',
      code: 'MongoClientClosed',
      detail: 'клиент mongo закрыл соединения',
    })
  })

}
