export { setTimeout as waiting } from 'node:timers/promises'
import * as util from 'node:util'
import { randomUUID } from 'node:crypto'
import { default as flat } from 'flat'
const { flatten } = flat


export const processExit = (code) => {throw new Error(`Завершение работы код ${code ?? 0}`)}

export const uuid4 = () => randomUUID()
export const flattenObj = (obj, params) => flatten(obj, params)

export const isPromise = d => util.types.isPromise(d)
export const isObject = d => (d === Object(d) && Object.prototype.toString.call(d) === '[object Object]')
export const isArray = d => Array.isArray(d)

export const currentDateObj = () => new Date()
export const futureDateObj = () => new Date(32503680000000)
export const tokenExpiresDateObj = expires => new Date(Date.now() + (expires * 1000))
export const currentMsec = () => Date.now()
export const currentSec = () => Math.round(Date.now() / 1000)

export const locationParser = location => {
  let s
  if (location.includes('#')) s = '#'
  else if (location.includes('?')) s = '?'
  else s = '/'

  const [u, q] = location.split(s)
  let r; const urn = (r = u.split('/').filter(Boolean).map(v => decodeURIComponent(v))).length > 0 ? r : null
  if (!q) return {urn, query: null}
  else return {urn, body: Object.fromEntries(decodeURIComponent(q).split('&').filter(Boolean).map(v => v.split('=')))}
}
