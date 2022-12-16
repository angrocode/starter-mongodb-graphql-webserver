import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { PassThrough } from 'node:stream'
import { server } from './server.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function graphQL(data) {

  /*
  const {urn} = data
  
  if (urn.length > 1)
    return {
      code: 404,
      headers: {'Content-Type': 'text/plain; charset=utf-8', 'Content-Language': 'ru'},
      resStream: new PassThrough().end('Ресурс не найден'),
      encode: true,
    }

  else if (urn[0] == 'console')
    return {
      code: 200,
      headers: {'Content-Type': 'text/html'},
      resStream: new PassThrough().end(readFileSync(join(__dirname, 'console', 'graphiql.html')), 'utf8'),
      encode: true,
    }
  */

  return server(data)

}
