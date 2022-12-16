import { PassThrough } from 'node:stream'


export async function e404() {

  return {
    code: 404,
    headers: {'Content-Type': 'text/plain; charset=utf-8', 'Content-Language': 'ru'},
    resStream: new PassThrough().end('Контент не найден', 'utf8'),
    encode: true,
  }

}