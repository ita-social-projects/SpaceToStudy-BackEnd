const mongoose = require('mongoose')
const { INVALID_ID } = require('~/app/consts/errors')
const { createError } = require('~/app/utils/errorsHelper')

const idValidation = (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(400, INVALID_ID)
  }
  next()
}

module.exports = idValidation
