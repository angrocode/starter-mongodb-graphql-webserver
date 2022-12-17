import { join } from 'node:path'
import { readdirSync, statSync, createReadStream } from 'node:fs'
import { serverConfig } from '../../config.js'
import { e404 } from './e404.js'
export { routerStatic }

const db = {}
const root = process.cwd()

// ключи соответсвуют ./router.js
const routing = {
  '/': join(root, 'web'),
  'tools': join(root, 'tools'),
}

// имена подставляемые в конец urn
// для получения фаилов по умолчанию
const wildcardNames = [
  'index.html'
]

const mimeTypes = {
  ico:  'image/x-icon',
  png:  'image/png',
  svg:  'image/svg+xml',
  html: 'text/html',
  css:  'text/css',
  js:   'application/json',
  txt:  'text/plain',
}

for (const [name, path] of Object.entries(routing)) {
  db[name] = scan(path)
}

function routerStatic({rout, urn}) {

  const key = rout.toString()
  const diffUrn = urn.filter(seg => !rout.includes(seg))
  const extension = diffUrn.length > 0 ? diffUrn.at(-1).split('.').at(-1) : null

  let okPath = ''
  let okType = ''

  if (extension in mimeTypes)
    for (const path of db[key]) {
      if (path.toString() == diffUrn.toString()) {
        okPath = join(routing[key], ...path)
        okType = extension in mimeTypes ? mimeTypes[extension] : mimeTypes['txt']
        break
      }
    }

  else
    wildcardLoop:
    for (const name of wildcardNames) {
      const xUrn = [...diffUrn, name].toString()
      for (const path of db[key]) {
        if (path.toString() == xUrn) {
          okPath = join(routing[key], ...path)
          const extension = name.split('.').at(-1)
          okType = extension in mimeTypes ? mimeTypes[extension] : mimeTypes['txt']
          break wildcardLoop
        }
      }
    }

  if (okPath)
    try {
      return {
        code: 200,
        headers: {'Content-Type': okType},
        resStream: createReadStream(okPath, 'utf8'),
        encode: !['image/x-icon', 'image/png'].includes(okType),
      }
    } catch (error) {
      return e404()
    }

  if (serverConfig.history) return routerStatic({rout: ['/'], urn: ['/']})

  return e404()

}

function scan(dir) {

  const files = []
  const path = []
  _exec()

  function _exec() {

    let list = []

    try {
      list = readdirSync(join(dir, ...path))
    } catch (e) {
      throw new Error(e)
      // "EACCES" "EPERM" нет доступа по правам
    }

    for (const [i, name] of list.entries()) {

      let isDir = false

      try {
        isDir = statSync(join(dir, ...path, name)).isDirectory()
      } catch (e) {
        throw new Error(e)
      }

      if (isDir) {
        path.push(name)
        _exec()
      } else {
        files.push([...path, name])
      }

      if (list.length - 1 == i) path.pop()
      
    }

  }

  return files

}
