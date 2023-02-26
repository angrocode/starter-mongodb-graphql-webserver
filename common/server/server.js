import { createServer as httpServer } from 'node:http'
import { createServer as httpsServer } from 'node:https'
import { PassThrough } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { emitWarning } from 'node:process'
import { serverConfig } from '../../config.js'
import { isObject } from '../utils.js'
import { getEncoding, contentDecoders, contentEncoders, urlParser } from './utils.js'
import { router } from './router.js'


let webServer = null

export { startWeb, stopWeb }

let countFlags = 0
function startWeb(message) {

  const startFlags = ['MongoAppRun', 'MongoClientOpen', 'MongoDaoInit']

  if (startFlags.includes(message.code)) countFlags++
  if (startFlags.length == countFlags ) { countFlags = 0; server() }

}

function stopWeb(message) {

  if (message.code == 'StopProject' && webServer) {
    webServer.close()
    webServer.closeAllConnections()
  }

}

function server() {

  if (!    isObject(serverConfig)) throw new Error('serverConfig должен быть объектом')
  if (!('secure' in serverConfig)) throw new Error('serverConfig должен содержать secure')
  if (!('host'   in serverConfig)) throw new Error('serverConfig должен содержать host')
  if (!('port'   in serverConfig)) throw new Error('serverConfig должен содержать port')

  webServer = serverConfig.secure ? https() : http()

  webServer.listen(serverConfig.port, serverConfig.host, error => error ? console.log(`Ошибка запуска вэб сервера ${error.message}`) : null)

  webServer.on('listening', () => {
    emitWarning('WebServerOpen', {
      type: 'Start/Stop Event',
      code: 'WebServerOpen',
      detail: 'вэб сервер запущен',
    })
  })

  webServer.on('close', () => {
    emitWarning('WebServerClosed', {
      type: 'Start/Stop Event',
      code: 'WebServerClosed',
      detail: 'вэб сервер остановлен',
    })
  })

}

function http() {

  return httpServer(async (req, res) => {

    const decoding = req.headers['content-encoding'] ? req.headers['content-encoding'].trim() : null
    const encoding = getEncoding(req.headers['accept-encoding'] ? req.headers['accept-encoding'].trim() : null)

    const reqStream = new PassThrough()
    const de = decoding ? contentDecoders(decoding) : PassThrough
    await pipeline(req, de(), reqStream).catch(e => console.log('Request pipeline', e))

    const routing = router(urlParser(req.url))
    const fn = routing.fn
    delete routing.fn

    const resData = await fn({
      ...routing,
      method: req.method,
      headers: req.headers,
      reqStream,
    })

    const {code, headers: _headers, encode, resStream} = resData

    const headers = {
      ..._headers,
      // 'Access-Control-Allow-Origin': '*',
      // 'Access-Control-Allow-Headers': '*',
      // 'Access-Control-Allow-Methods': 'POST, GET',
    }

    if (encode && encoding) headers['Content-Encoding'] = encoding
    res.writeHead(code, headers)

    const en = encode && encoding ? contentEncoders(encoding) : PassThrough
    await pipeline(resStream, en(), res).catch(e => console.log('Response pipeline', e))

  })

}

function https() {
  
  throw new Error(`https сервер не реализован`)

  return httpsServer(async (req, res) => {})

}
