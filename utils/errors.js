const createError = (statusCode, message) => {
  const err = new Error(message)
  err.statusCode = statusCode
  return err
}

const handleError = (err, req, res, next) => {
  const { statusCode, message } = err
  res.status(statusCode).json({
    statusCode, 
    message
  })
}

module.exports = {
  createError,
  handleError,
}
