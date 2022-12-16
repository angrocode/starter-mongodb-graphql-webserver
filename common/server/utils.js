import zlib from 'node:zlib'


export function getEncoding(str) {

  if (str.includes('identity')) return null
  if (str.includes('*')) return 'br'
  if (str.includes('br')) return 'br'
  if (str.includes('gzip')) return 'gzip'
  if (str.includes('deflate')) return 'deflate'

  return null

}

export function contentDecoders(type) {
  switch (type) {
    case 'gzip': return zlib.createGunzip
    case 'deflate': return zlib.createInflate
    case 'br': return zlib.createBrotliDecompress
  }
}

export function contentEncoders(type) {
  switch (type) {
    case 'gzip': return zlib.createGzip
    case 'deflate': return zlib.createDeflate
    case 'br': return zlib.createBrotliCompress
  }
}

export function cookieParser(cookie) {
  return cookie.split(';').filter(Boolean).reduce((acc, iter) => {
      const c = iter.split('=')
      acc[c[0].trim()] = c[1].trim()
      return acc
    }, {})
}

export function urlParser(url) {

  let _url, urn, params

  _url = url.split('?')

  urn = _url[0].toString() != '/'
    ? decodeURIComponent(_url[0]).split('/').filter(Boolean)
    : ['/']

  params = _url[1]
    ? Object.fromEntries(decodeURIComponent(_url[1]).split('&').filter(Boolean).map(c => {
      const sp = c.split('=')
      if (sp.length == 1) sp.push('')
      return sp
    }  ))
    : {}

  return {urn, params}

}
