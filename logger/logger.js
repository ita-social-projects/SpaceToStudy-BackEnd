const { createLogger, transports, format } = require('winston')
const { combine, timestamp, json, metadata, errors, prettyPrint } = format
require('winston-mongodb')

const {
  config: { MONGODB_URL }
} = require('~/configs/config')

const logger = createLogger({
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'DD-MM-YYYY hh:mm:ss A' }),
    metadata(),
    json(),
    prettyPrint()
  ),
  transports: [
    new transports.Console({
      handleExceptions: true
    })
  ]
})

if (process.env.NODE_ENV !== 'test') {
  logger.add(
    new transports.MongoDB({
      level: 'error',
      db: MONGODB_URL,
      options: { useUnifiedTopology: true },
      expireAfterSeconds: 604800,
      handleExceptions: true
    })
  )
}

module.exports = logger
