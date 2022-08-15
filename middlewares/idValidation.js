const mongoose = require('mongoose')
const { INVALID_ID } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')

const idValidation = (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(400, INVALID_ID)
  }
  next()
}

module.exports = idValidation
