import { createServer as httpServer } from 'node:http'
import { createServer as httpsServer } from 'node:https'
import { generateKeyPairSync, createSign } from 'node:crypto'
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
  if (startFlags.length == countFlags ) { countFlags = 0; server_loader() }

}

function stopWeb(message) {

  if (message.code == 'StopProject' && webServer) {
    webServer.close()
    webServer.closeAllConnections()
  }

}

function server_loader() {

  if (!    isObject(serverConfig)) throw new Error('serverConfig должен быть объектом')
  if (!('secure' in serverConfig)) throw new Error('serverConfig должен содержать secure')
  if (!('host'   in serverConfig)) throw new Error('serverConfig должен содержать host')
  if (!('port'   in serverConfig)) throw new Error('serverConfig должен содержать port')

  webServer = serverConfig.secure ? httpsServer(micro509(), server) : httpServer(server)

  const port = serverConfig?.port ? serverConfig?.port : serverConfig.secure ? 443 : 80
  webServer.listen(port, serverConfig.host, error => error ? console.log(`Ошибка запуска вэб сервера ${error.message}`) : null)

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

async function server(req, res) {
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
}

function micro509(key = 2048, sign = 256) {
  const {publicKey, privateKey} = generateKeyPairSync('rsa', {
    modulusLength: key,
    publicKeyEncoding:  {type: 'spki',  format: 'der'},
    privateKeyEncoding: {type: 'pkcs8', format: 'pem'},
  })

  const algIdentKey = {1:'05', 256:'0B', 384:'0C', 512:'0D'}
  const algorithmIdentifier = `300D06092A864886F70D0101${algIdentKey[sign]}0500`

  const validity = ''
    + '30' + _toHex(34) // GeneralizedTime
    + '18' + _toHex(15) + _toHex('20000101000001Z')
    + '18' + _toHex(15) + _toHex('30001231235959Z')

  const tbsLenDec = 7 + (algorithmIdentifier.length / 2) + (validity.length / 2) + publicKey.byteLength
  const tbsLenHex = _toHex(tbsLenDec)
  const tbsCertificate = ''
    + '30' + (80 + (tbsLenHex.length / 2)) + tbsLenHex
    + '020101' + algorithmIdentifier + '3000'               
    + validity + '3000' + publicKey.toString('hex')

  const signature  = createSign(`SHA${sign}`).update(tbsCertificate, 'hex').end().sign(privateKey)
  const signLenHex = _toHex(1 + signature.byteLength)
  const signLenLen = signLenHex.length / 2

  const certLenDec = 0
    + (tbsCertificate.length / 2)
    + (algorithmIdentifier.length / 2)
    + (2 + signLenLen) + 1 + signature.byteLength
  const certLenHex  = _toHex(certLenDec)
  const certificate = ''
    + '30' + (80 + (certLenHex.length / 2)) + certLenHex
    + tbsCertificate + algorithmIdentifier
    + '03' + (80 + signLenLen) + signLenHex + '00' + signature.toString('hex')

  const b64Arr = Buffer.from(certificate, 'hex').toString('base64').match(/.{0,64}/g)
  return {
    key: privateKey,
    cert: '-----BEGIN CERTIFICATE-----\n' + b64Arr.join('\n') + '-----END CERTIFICATE-----\n'
  }

  function _toHex(data) {
    if (typeof data == 'string') {
      return Buffer.from(data, 'utf8').toString('hex')
    } else if (typeof data == 'number') {
      const hex = data.toString(16)
      return hex.padStart(hex.length + hex.length % 2, '0')
    }
  }
}
