import { serverConfig } from '../../config.js'
import { routerStatic } from './router-static.js'
import { graphQL } from './graphql/index.js'
import { e404 } from './e404.js'

const routing = {
  '/':       {fn: routerStatic},
  'graphql': {fn: graphQL},
  'tools':   {fn: routerStatic},
  'e404':    {fn: e404},
}

export function router({urn, params}) {

  // оптимизация
  if (urn[0] == 'graphql') return {...routing['graphql'], params}

  if (urn[0] == '/') return {...routing['/'], rout: ['/'], urn, params}

  let okRout = ''
  let currentRout = ''

  for (const [i, seg] of urn.entries()) {
    currentRout = i == 0 ? seg : currentRout + ',' + seg
    if (currentRout in routing) okRout = currentRout
  }

  if (okRout) return {...routing[okRout], rout: okRout.split(','), urn, params}

  if (serverConfig.history) return {...routing['/'], rout: ['/'], urn: ['/'], params}

  return {...routing['e404'], urn, params}

}
