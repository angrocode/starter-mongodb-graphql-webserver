
const rootDir = process.cwd()

export const mongoConfig = Object.freeze({
  loading: false, // запуск в месте с проектом: true, если запущен отдельно или удалённый: false
  pathDb: `${rootDir}/common/mongo/db`,
  pathDbms: `${rootDir}/common/mongo/bin`,
  host: '127.0.0.1',
  port: 27033,
})

export const serverConfig = Object.freeze({
  secure: false,
  host: '127.0.0.1',
  port: 8081,
  history: true,
})
