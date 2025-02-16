const { INVALID_LANGUAGE } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')
const {
  enums: { APP_LANG_ENUM, APP_LANG_DEFAULT }
} = require('~/consts/validation')

const langMiddleware = (req, _res, next) => {
  let lang = req.acceptsLanguages(...APP_LANG_ENUM) || APP_LANG_DEFAULT

  if (!APP_LANG_ENUM.includes(lang)) {
    throw createError(400, INVALID_LANGUAGE)
  }

  req.lang = lang
  next()
}

module.exports = langMiddleware
