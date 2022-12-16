import { PassThrough } from 'node:stream'
import { validateSchema, buildSchema, validate, specifiedRules, parse, execute, GraphQLError } from 'graphql'
import { schema, resolvers } from '../../../graphql/index.js'


let s, e
try {
  s = buildSchema(schema)
} catch (e) {
  throw new Error(`\x1b[31m ошибка сборки схемы ${e.message} \x1b[0m`)
}
if ((e = validateSchema(s)).length) throw new Error(`\x1b[31m ошибка проверки схемы ${e} \x1b[0m`)

const options = {
  schema: s,
  rootValue: resolvers,
  context: {},
  fieldResolver: null,
  typeResolver: null,
}

export async function server({params, method, headers, reqStream}) {

  const errors = []

  const contentType = headers['content-type']
    ? headers['content-type'].split(';').reduce((a, v, i) => {
      if (!i) a.type = v.trim()
      else a.charset = v.split('=')[1].trim()
      return a
    }, {type: 'application/json', charset: 'utf8'})
    :  {type: 'application/json', charset: 'utf8'}

  const decoder = new TextDecoder(contentType.charset)

  let reqBody, documentAST, result

  if (!['application/json', 'application/graphql'].includes(contentType.type))
    errors.push(new GraphQLError(`только application/json, application/graphql, текущий ${contentType.type}`))

  if (['GET'].includes(method)) {
    if (!Object.keys(params).length) errors.push(new GraphQLError(`запрос не может быть пустым`))

    if (Object.keys(params).filter(k => !['query', 'variables', 'operationName'].includes(k)).length > 0)
      errors.push(new GraphQLError(`graphql get принимает только ключи 'query', 'variables', 'operationName'`))

    reqBody = Object.entries(params).reduce((a, [k, v]) => {
      if (['query', 'variables', 'operationName'].includes(k)) a[k] = v
      return a
    }, {})

  } else if (['POST'].includes(method)) {
    const chunks = []
    for await (const chunk of reqStream) chunks.push(chunk)
    if (!chunks.length) errors.push(new GraphQLError(`запрос не может быть пустым`))
    const buff = decoder.decode(Buffer.concat(chunks))

    try {
      reqBody = JSON.parse(buff)
    } catch (e) {
      reqBody = {}
      errors.push(new GraphQLError(`ошибка post json.parse ${e.message}`))
    }

  } else {
    reqBody = {}
    errors.push(new GraphQLError(`не поддерживаемый тип запроса ${method}`))
  }

  try {
    documentAST = parse(reqBody.query, {noLocation: true})
  } catch (e) {
    errors.push(new GraphQLError(`анализ запроса ${e.message}`))
  }

  try {
    let e
    if ((e = validate(options.schema, documentAST, specifiedRules)).length)
      errors.push(new GraphQLError(`проверка запроса ${e}`))
  } catch (e) {
    errors.push(new GraphQLError(`проверка запроса ${e.message}`))
  }

  try {
    result = await execute({
      schema: options.schema,
      document: documentAST,
      rootValue: options.rootValue,
      contextValue: options.context,
      variableValues: reqBody.variables,
      operationName: reqBody.operationName,
      fieldResolver: options.fieldResolver,
      typeResolver: options.typeResolver
    })
  } catch (e) {
    errors.push(new GraphQLError(`выполнение запроса ${e.message}`))
  }

  const resBody = {}
  const gqlErrors = result?.errors ?? []

  if (errors.length > 0 || gqlErrors.length > 0)
    resBody.errors = [...errors, ...gqlErrors].map(e => ({...e, message:e.message.replaceAll('"', "'")}))
  resBody.data = result?.data ?? {}

  return {
    code: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'POST, GET',
      'Content-Type': `application/json; charset=utf-8`,
    },
    resStream: new PassThrough().end(Buffer.from(JSON.stringify(resBody), 'utf8')),
    encode: true
  }

}
