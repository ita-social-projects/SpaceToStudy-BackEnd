const tokenService = require('~/services/token')
const { UNAUTHORIZED } = require('~/consts/errors')
const { FORBIDDEN } = require('~/consts/errors')

const validateUserToken = (req, res) => {
  const accessToken = req?.cookies?.accessToken

  if (!accessToken) return res.status(401).json(UNAUTHORIZED)

  const decodedToken = tokenService.validateAccessToken(accessToken)

  if (!decodedToken) return res.status(401).json(UNAUTHORIZED)

  if (decodedToken.id !== req?.params?.id) return res.status(403).json(FORBIDDEN)

  return true
}

module.exports = validateUserToken
