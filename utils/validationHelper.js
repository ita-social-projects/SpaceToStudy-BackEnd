const { FIELD_IS_NOT_DEFINED, FIELD_IS_NOT_OF_PROPER_TYPE, FIELD_IS_NOT_OF_PROPER_LENGTH } = require('~/consts/errors')
const { createError } = require('./errorsHelper')

const validateRequired = (schemaFieldKey, required, field) => {
  if (required && !field) {
    throw createError(422, FIELD_IS_NOT_DEFINED(schemaFieldKey))
  }
}

const validateType = (schemaFieldKey, type, field) => {
  if (type != typeof field) {
    throw createError(422, FIELD_IS_NOT_OF_PROPER_TYPE(schemaFieldKey, type))
  }
}

const validateLength = (schemaFieldKey, length, field) => {
  if (field.length < length.min || field.length > length.max) {
    throw createError(422, FIELD_IS_NOT_OF_PROPER_LENGTH(schemaFieldKey, length))
  }
}

const validateFunc = {
  required: validateRequired,
  type: validateType,
  length: validateLength
}

module.exports = {
  validateRequired,
  validateType,
  validateLength,
  validateFunc
}
