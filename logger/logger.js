const { createLogger, transports, format } = require('winston')
const { combine, timestamp, json, metadata } = format
// require('winston-mongodb')

const logger = createLogger({
  format: combine(timestamp(), metadata(), json()),
  transports: [
    // new transports.MongoDB({
    //   db: process.env.MONGODB_URL,
    //   options: { useUnifiedTopology: true },
    //   expireAfterSeconds: 604800,
    //   handleExceptions: true
    // }),
    new transports.Console({
      handleExceptions: true
    })
  ]
})

module.exports = logger
