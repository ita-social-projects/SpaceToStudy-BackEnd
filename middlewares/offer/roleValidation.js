const { createError } = require('~/utils/errorsHelper')
const { VALIDATION_ERROR } = require('~/consts/errors')
const roleValidation = (req, res, next) => {
  const { role } = req.user
  const { FAQ } = req.body

  if (FAQ && role !== 'tutor') {
    next(createError(409, VALIDATION_ERROR("You must be a tutor to add or update offers' FAQ")))
  }

  next()
}

module.exports = roleValidation
