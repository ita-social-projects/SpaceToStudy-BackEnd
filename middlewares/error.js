const {
  INTERNAL_SERVER_ERROR,
  DOCUMENT_ALREADY_EXISTS,
  MONGO_SERVER_ERROR,
  VALIDATION_ERROR
} = require('~/consts/errors')
const logger = require('~/logger/logger')
const getUniqueFields = require('~/utils/getUniqueFields')

const errorMiddleware = (err, _req, res, _next) => {
  const { name, status, code, message } = err
  logger.error(err)

  const databaseErrors = {
    MongoServerError: (code, message) => {
      if (code === 11000) {
        const uniqueFields = getUniqueFields(message)

        return res.status(409).json({
          status: 409,
          ...DOCUMENT_ALREADY_EXISTS(uniqueFields)
        })
      }
      if (code === 99999) {
        return res.status(500).json({
          status: 500,
          ...MONGO_SERVER_ERROR(message)
        })
      }
      return res.status(400).json({
        status: 400,
        ...MONGO_SERVER_ERROR(message)
      })
    },
    ValidationError: (code, message) => {
      return res.status(409).json({
        status: 409,
        ...VALIDATION_ERROR(message)
      })
    }
  }

  if (name in databaseErrors) {
    const handleDatabaseError = databaseErrors[name]
    return handleDatabaseError(code, message)
  }

  if (!status && !code) {
    return res.status(500).json({
      status: 500,
      code: INTERNAL_SERVER_ERROR.code,
      message
    })
  }

  res.status(status).json({
    status,
    code,
    message
  })
}

module.exports = errorMiddleware
