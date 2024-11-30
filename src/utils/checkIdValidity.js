const mongoose = require('mongoose')
const { INVALID_ID } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')

const checkIdValidity = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(400, INVALID_ID)
  }
}

module.exports = checkIdValidity
