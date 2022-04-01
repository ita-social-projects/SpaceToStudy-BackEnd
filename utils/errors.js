const createError = (status, errorCode, message) => {
  const err = new Error(status)
  err.status = status
  err.errorCode = errorCode
  err.message = message
  return err
}

const handleError = (err, req, res, next) => {
  const { status, errorCode, message } = err
  res.status(status).json({
    status, 
    errorCode, 
    message,
  })
}

module.exports = {
  createError,
  handleError,
}
