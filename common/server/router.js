import { routerStatic } from './router-static.js'
import { graphQL } from './graphql/index.js'
import { e404 } from './e404.js'

const routing = {
  '/': {fn: routerStatic, key: 'default'},
  'graphql': {fn: graphQL},
  'tools': {fn: routerStatic, key: 'tools'},
  'e404': {fn: e404},
}

export function router({urn, params}) {

  // оптимизация
  if (urn[0] == 'graphql') return {...routing['graphql'], params}

  if (urn[0] == '/') return {...routing['/'], rout: [], urn, params}

  let okRout = ''
  let curentRout = ''

  for (const [i, seg] of urn.entries()) {
    curentRout = i == 0 ? seg : curentRout + ',' + seg
    if (curentRout in routing) okRout = curentRout
  }

  if (okRout) return {...routing[okRout], rout: okRout.split(','), urn, params}

  return {...routing['e404'], urn, params}

}
