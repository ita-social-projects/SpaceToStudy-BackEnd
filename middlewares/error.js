const { INTERNAL_SERVER_ERROR } = require('~/consts/errors')

const errorMiddleware = (err, _req, res, _next) => {
  const { status, code, message } = err

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
