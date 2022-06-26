const {
  errorCodes: { UNAUTHORIZED, NOT_FOUND },
  errorMessages: { userNotAuthorized, wrongPath }
} = require('~/consts/errors')

const createError = (status, errorCode, message) => {
  const err = new Error(status)
  err.status = status
  err.errorCode = errorCode
  err.message = message
  return err
}

const createUnauthorizedError = () => {
  return createError(401, UNAUTHORIZED, userNotAuthorized)
}

const createNotFoundError = () => {
  return createError(404, NOT_FOUND, wrongPath)
}

module.exports = {
  createError,
  createUnauthorizedError,
  createNotFoundError
}
