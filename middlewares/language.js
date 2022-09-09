const { INVALID_LANGUAGE } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')
const {
  enums: { LANG_ENUM }
} = require('~/consts/validation')

const langMiddleware = (req, _res, next) => {
  let lang = req.acceptsLanguages(...LANG_ENUM)

  if (!lang) {
    req.lang = LANG_ENUM[0]
    return next()
  }

  if (!LANG_ENUM.includes(lang)) {
    throw createError(400, INVALID_LANGUAGE)
  }

  req.lang = lang
  next()
}

module.exports = langMiddleware
