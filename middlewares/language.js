const { INVALID_LANGUAGE } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')

const langMiddleware = (req, _res, next) => {
  let lang = req.query.lang
  const validLangs = ['en', 'ua']

  if (!lang) {
    req.lang = validLangs[0]
    return next()
  }

  if (!validLangs.includes(lang)) {
    throw createError(400, INVALID_LANGUAGE)
  }

  req.lang = lang
  next()
}

module.exports = langMiddleware
