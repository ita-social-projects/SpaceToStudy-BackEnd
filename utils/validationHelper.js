const { FIELD_IS_NOT_DEFINED, FIELD_IS_NOT_OF_PROPER_TYPE, FIELD_IS_NOT_OF_PROPER_LENGTH } = require('~/consts/errors')
const { createError } = require('./errorsHelper')

const validateRequired = (schemaField, field) => {
  const [schemaKey, schemaValue] = schemaField
  if (schemaValue?.required) {
    if (!field) {
      throw createError(422, FIELD_IS_NOT_DEFINED(schemaKey))
    }
  }
}

const validateType = (schemaField, field) => {
  const [schemaKey, schemaValue] = schemaField
  if (schemaValue.type) {
    if (schemaValue.type != typeof field) {
      throw createError(422, FIELD_IS_NOT_OF_PROPER_TYPE(schemaKey, schemaValue.type))
    }
  }
}

const validateLength = (schemaField, field) => {
  const [schemaKey, schemaValue] = schemaField
  if (schemaValue.length) {
    if (field.length < schemaValue.length.min || field.length > schemaValue.length.max) {
      throw createError(422, FIELD_IS_NOT_OF_PROPER_LENGTH(schemaKey, schemaValue.length))
    }
  }
}

module.exports = {
  validateRequired,
  validateType,
  validateLength
}
