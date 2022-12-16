import { join } from 'node:path'
import { readdirSync, statSync, createReadStream } from 'node:fs'
import { readFile as prReadFile } from 'node:fs/promises'
import { PassThrough } from 'node:stream'
import { e404 } from './e404.js'

const db = {}
const root = process.cwd()

// ключи указываються в ./router.js
const routing = {
  'default': join(root, 'web'),
  'tools': join(root, 'tools'),
}

// имена подставляемые в конец urn
// если не найдено совпадение
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

export function routerStatic({key, rout, urn}) {

  if (!key) return e404()

  const diffUrn = urn.filter(seg => !rout.includes(seg) && seg != '/')

  let okPath = ''
  let okType = ''

  for (const path of db[key]) {
    if (path.toString() == diffUrn.toString()) {
      okPath = join(routing[key], ...path)
      const ext = path.at(-1).split('.').at(-1)
      okType = ext in mimeTypes ? mimeTypes[ext] : mimeTypes['txt']
      break
    }
  }

  if (!okPath)
    wildcardLoop:
    for (const name of wildcardNames) {
      const xUrn = [...diffUrn, name].toString()
      for (const path of db[key]) {
        if (path.toString() == xUrn) {
          okPath = join(routing[key], ...path)
          const ext = name.split('.').at(-1)
          okType = ext in mimeTypes ? mimeTypes[ext] : mimeTypes['txt']
          break wildcardLoop
        }
      }
    }

  if (okPath) 
    return {
      code: 200,
      headers: {'Content-Type': okType},
      resStream: createReadStream(okPath, 'utf8'),
      encode: !['image/x-icon', 'image/png'].includes(okType),
    }

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
      //TODO: обработка ошибок
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
