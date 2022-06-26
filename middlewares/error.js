const {
  errorCodes: { INTERNAL_SERVER_ERROR }
} = require('~/consts/errors')

const errorMiddleware = (err, _req, res, _next) => {
  const { status, errorCode, message } = err

  if (!status && !errorCode) {
    return res.status(500).json({
      status: 500,
      errorCode: INTERNAL_SERVER_ERROR,
      message
    })
  }
  res.status(status).json({
    status,
    errorCode,
    message
  })
}

module.exports = errorMiddleware
