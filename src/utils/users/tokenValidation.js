const tokenService = require('~/services/token')
const ValidationError = require('~/consts/errors')

const validateUserToken = (req, res) => {
  const accessToken = req?.cookies?.accessToken

  if (!accessToken) return res.status(401).end()

  const decodedToken = tokenService.validateAccessToken(accessToken)

  if (!decodedToken) return res.status(401).end()

  if (decodedToken.id !== req?.params?.userId) {
    return ValidationError
  }

  return decodedToken
}

module.exports = validateUserToken
