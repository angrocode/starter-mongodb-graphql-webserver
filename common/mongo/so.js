import { mongodb } from './client.js'
import { collUnits, collUsers, collAgents, create, read, reads, update } from './dao.js'


/**
 * Создание юнита
 * @param document {mongodb.Document}
 * @returns {Promise<Object|null>}
 */
export async function createUnit(document) {
  return await create(collUnits, document)
}

/**
 * Получение юнита
 * @param filter {mongodb.Filter=} ключи для поиска документа
 * @param options {mongodb.FindOptions=} опции возврата данных, монго
 * @returns {Promise<Object|null>}
 */
export async function readUnit(filter, options) {
  return await read(collUnits, filter, options)
}

/**
 * Получения массива юнитов
 * @param filter {mongodb.Filter=} ключи для поиска документа
 * @param options {mongodb.FindOptions=} опции возврата данных, монго
 * @returns {Promise<[Object]|null>}
 */
export async function readUnits(filter, options) {
  return await reads(collUnits, filter, options)
}

/**
 * Обновление одного юнита
 * @param filter {mongodb.Filter=} ключи для поиска документа
 * @param payload {object} данные для обновления
 * @param options {object=} опции обновления, не монго
 * @returns {Promise<void>}
 */
export async function updateUnit(filter, payload, options) {
  return await update(collUnits, filter, payload, options)
}



/**
 * Создание пользователя
 * @param document {mongodb.Document}
 * @returns {Promise<Object|null>}
 */
export async function createUser(document) {
  return await create(collUsers, document)
}

/**
 * Получение пользователя
 * @param filter {mongodb.Filter=}
 * @param options {mongodb.FindOptions=}
 * @returns {Promise<Object|null>}
 */
export async function readUser(filter, options) {
  return await read(collUsers, filter, options)
}

/**
 * Обновление одного пользователя
 * @param filter {mongodb.Filter=} ключи для поиска документа
 * @param payload {object} данные для обновления
 * @param options {object=} опции обновления, не монго
 * @returns {Promise<void>}
 */
export async function updateUser(filter, payload, options) {
  return await update(collUsers, filter, payload, options)
}



/**
 * Создание агента
 * @param document {mongodb.Document}
 * @returns {Promise<Object|null>}
 */
export async function createAgent(document) {
  return await create(collAgents, document)
}

/**
 * Получение агента
 * @param filter {mongodb.Filter=}
 * @param options {mongodb.FindOptions=}
 * @returns {Promise<Object|null>}
 */
export async function readAgent(filter, options) {
  return await read(collAgents, filter, options)
}

/**
 * Получение массива агентов
 * @param filter {mongodb.Filter=}
 * @param options {mongodb.FindOptions=}
 * @returns {Promise<[Object]|null>}
 */
export async function readAgents(filter, options) {
  return await reads(collAgents, filter, options)
}

/**
 * Обновление одного агента
 * @param filter {mongodb.Filter=} ключи для поиска документа
 * @param payload {object} данные для обновления
 * @param options {object=} опции обновления, не монго
 * @returns {Promise<void>}
 */
export async function updateAgent(filter, payload, options) {
  return await update(collAgents, filter, payload, options)
}
