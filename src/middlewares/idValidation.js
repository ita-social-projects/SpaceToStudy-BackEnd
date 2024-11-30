const checkIdValidity = require('~/utils/checkIdValidity')

const idValidation = (req, res, next, id) => {
  checkIdValidity(id)
  next()
}

module.exports = idValidation
