const cookie = require('cookie')
const { createUnauthorizedError, createForbiddenError } = require('~/utils/errorsHelper')
const tokenService = require('~/services/token')

const authMiddleware = (req, _res, next) => {
  const { accessToken } = req.cookies

  if (!accessToken) {
    throw createUnauthorizedError()
  }

  const userData = tokenService.validateAccessToken(accessToken)
  if (!userData) {
    throw createUnauthorizedError()
  }

  req.user = userData
  next()
}

const authSocketMiddleware = (socket, next) => {
  if (!socket.request.headers.cookie) {
    return next(createUnauthorizedError())
  }

  const { accessToken } = cookie.parse(socket.request.headers?.cookie)

  if (!accessToken) {
    return next(createUnauthorizedError())
  }

  const userData = tokenService.validateAccessToken(accessToken)
  if (!userData) {
    return next(createUnauthorizedError())
  }

  socket.user = userData
  next()
}

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(createForbiddenError())
    }
    next()
  }
}

module.exports = { authMiddleware, authSocketMiddleware, restrictTo }
