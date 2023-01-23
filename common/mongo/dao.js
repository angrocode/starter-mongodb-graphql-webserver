import { emitWarning } from 'node:process'
import { flattenObj, isArray } from '../utils.js'
import { mongodb, mongoClient } from './client.js'


export { mongoClient, mongodb }
export { startDao }

let countFlags = 0
function startDao(message) {

  const startFlags = ['MongoClientOpen']

  if (startFlags.includes(message.code)) countFlags++
  if (startFlags.length == countFlags ) { countFlags = 0; dao() }

}

/**
 *  Collection "units"
 *  @type {mongodb.Collection}
 */
let collUnits = null

/**
 *  Collection "users"
 *  @type {mongodb.Collection}
 */
let collUsers = null

/**
 *  Collection "agents"
 *  @type {mongodb.Collection}
 */
let collAgents = null

/**
 *  Collection "tasks"
 *  @type {mongodb.Collection}
 */
let collTasks = null

async function dao() {

  /**
   *  DB "vk-app"
   *  @type {mongodb.Db}
   */
  const DBApp = await mongoClient.db('vk-app')

  /**
   *  DB "vk-scheduler"
   *  @type {mongodb.Db}
   */
  const DBScheduler = await mongoClient.db('vk-scheduler')

  collUnits  = DBApp.collection('units')
  collUsers  = DBApp.collection('users')
  collAgents = DBApp.collection('agents')
  collTasks  = DBApp.collection('tasks')

  emitWarning('MongoDaoInit', {
    type: 'Start/Stop Event',
    code: 'MongoDaoInit',
    detail: 'dao mongo проинициализирован',
  })

}

//  ------------------

/**
 * Создание одного документа
 * @param collection {mongodb.Collection}
 * @param document {mongodb.Document}
 * @returns {Promise<Object | null>}
 */
async function create(collection, document) {

  return await collection.insertOne(document)

}

/**
 * Получение одного документа
 * @param collection {mongodb.Collection}
 * @param filter {mongodb.Filter} ключи для поиска документа
 * @param options {object=} опции
 * @returns {Promise<Object | null>}
 */
async function read(collection, filter, options) {

  const _filter = filter && Object.keys(filter).length ? {$and: Object.entries(filter).map(([key, value]) => ({[key]: value}))} : {}

  return await collection.findOne(_filter, options)

}

/**
 * Получение нескольких документов
 * @param collection {mongodb.Collection}
 * @param filter {mongodb.Filter} ключи для поиска документа
 * @param options {object=} опции
 * @returns {Promise<[Object] | null>}
 */
async function reads(collection, filter, options) {

  const _filter = filter && Object.keys(filter).length ? {$and: Object.entries(filter).map(([key, value]) => ({[key]: value}))} : {}

  return await collection.find(_filter, options).toArray()

}

/**
 * Обновление одного документа
 * @param collection {mongodb.Collection}
 * @param filter {mongodb.Filter} ключи для поиска документа
 * @param payload {object}
 * @param params {object=}
 * @returns {Promise<void>}
 */
async function update(collection, filter, payload, params) {

  params = {flatten: true, mergeArray: true, ...params}

  if (params.flatten) payload = flattenObj(payload, {safe: true})

  const _filter = filter && Object.keys(filter).length ? {$and: Object.entries(filter).map(([key, value]) => ({[key]: value}))} : {}

  const pipeline = []

  pipeline.push({$match: _filter})

  Object.entries(payload).forEach(([key, value]) => {
    if (isArray(value) && params.mergeArray && value !== undefined)
      pipeline.push({$set: {[key]: {
        $cond: {
          if: {$and: [ `$${key}`, {$isArray: `$${key}`} ]},
          then: {$concatArrays: [`$${key}`, value]},
          else: value
        }
      }}})
    else if (value !== undefined) pipeline.push({$set: {[key]: value}})
  })

  //pipeline.push({$set: {'updatedAt': new Date()}})

  const intoKey = ['db', 'coll']
  const mergeInto = collection.namespace.split('.').reduce((a, c, i) => {
    a[intoKey[i]] = c
    return a
  }, {})

  pipeline.push(
    {$merge: {
      into: mergeInto,
      on: '_id',
      whenMatched: 'merge',
      whenNotMatched: 'discard'
    }}
  )

  await collection.aggregate(pipeline).tryNext()

  //return await collection.findOne(_filter)

}

// export { DBApp, DBScheduler }
export { collUnits, collUsers, collAgents, collTasks }
export { create, read, reads, update }
