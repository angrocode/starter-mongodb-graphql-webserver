
const rootDir = process.cwd()

export const mongoConfig = Object.freeze({
  loading: true, // запуск в месте с проектом: true, если запущен отдельно или удалённый: false
  pathDb: `${rootDir}/common/mongo/db`,
  pathDbms: `${rootDir}/common/mongo/bin`,
  host: '127.0.0.1',
  port: 27033,
})

export const serverConfig = Object.freeze({
  secure: false,
  host: '127.0.0.1',
  port: 8081,
  static: `${rootDir}/website`,
})

// C:\Code\VK\_project\_build\_11back\common\mongo\bin\mongod.exe --port 27033 --dbpath C:\Code\VK\_project\_build\_11back\common\mongo\db

