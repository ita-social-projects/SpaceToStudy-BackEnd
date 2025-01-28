const {
  FIELD_IS_NOT_DEFINED,
  FIELD_IS_NOT_OF_PROPER_TYPE,
  FIELD_IS_NOT_OF_PROPER_LENGTH,
  FIELD_IS_NOT_IN_RANGE,
  FIELD_IS_NOT_OF_PROPER_FORMAT,
  FIELD_IS_NOT_OF_PROPER_ENUM_VALUE,
  OBJECT_MUST_HAVE_PROPERTY
} = require('~/consts/errors')
const { createError } = require('../errorsHelper')
const { checkAreTypesValid } = require('./typeHelpers')

const validateRequired = (schemaFieldKey, required, field) => {
  if (required && !field) {
    throw createError(422, FIELD_IS_NOT_DEFINED(schemaFieldKey))
  }
}

const validateTypes = (schemaFieldKey, typeOrTypes, field) => {
  const isTypeValid = checkAreTypesValid(typeOrTypes, field)

  if (!isTypeValid) {
    throw createError(422, FIELD_IS_NOT_OF_PROPER_TYPE(schemaFieldKey, typeOrTypes))
  }
}

const validateLength = (schemaFieldKey, length, field) => {
  if (field.length < length.min || field.length > length.max) {
    throw createError(422, FIELD_IS_NOT_OF_PROPER_LENGTH(schemaFieldKey, length))
  }
}

const validateNonEmptyObject = (fieldName, schemaFieldKey) => {
  if (Object.keys(fieldName).length === 0) {
    throw createError(422, OBJECT_MUST_HAVE_PROPERTY(schemaFieldKey))
  }
}

const validateRange = (schemaFieldKey, range, field) => {
  if (field < range.min || field > range.max) {
    throw createError(422, FIELD_IS_NOT_IN_RANGE(schemaFieldKey, range))
  }
}

const validateRegex = (schemaFieldKey, regex, field) => {
  if (!regex.test(field)) {
    throw createError(422, FIELD_IS_NOT_OF_PROPER_FORMAT(schemaFieldKey))
  }
}

const validateEnum = (schemaFieldKey, enumSet, field) => {
  const isEnumValue = enumSet.some((value) => value === field)
  if (!isEnumValue) {
    throw createError(422, FIELD_IS_NOT_OF_PROPER_ENUM_VALUE(schemaFieldKey, enumSet))
  }
}

const fieldValidator = {
  type: validateTypes,
  length: validateLength,
  range: validateRange,
  regex: validateRegex,
  enum: validateEnum
}

module.exports = {
  validateRequired,
  validateTypes,
  validateLength,
  validateNonEmptyObject,
  validateRange,
  fieldValidator
}
