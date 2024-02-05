const { FIELD_IS_NOT_DEFINED, FIELD_IS_NOT_OF_PROPER_TYPE, FIELD_CAN_BE_ONE_OF } = require('~/consts/errors')

const { createError } = require('~/utils/errorsHelper')
const deleteNotAllowedFields = require('~/utils/cooperations/sections/deleteNotAllowedFields')

const availabilityFields = ['status', 'date']
const commonRequiredFields = ['title', 'availability']

const validateCommonFields = (resource, requiredFields = commonRequiredFields) => {
  for (const property of requiredFields) {
    if (!resource[property]) {
      throw createError(400, FIELD_IS_NOT_DEFINED(`resource ${property}`))
    }
  }

  if (typeof resource.title !== 'string') {
    throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('resource title', 'string'))
  }

  if (resource.description && typeof resource.description !== 'string') {
    throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('resource description', 'string'))
  }

  if (typeof resource.availability !== 'object' || Array.isArray(resource.availability)) {
    throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('resource availability', 'object'))
  }

  deleteNotAllowedFields(resource.availability, availabilityFields)

  for (const property of availabilityFields) {
    if (!(property in resource.availability)) {
      throw createError(400, FIELD_IS_NOT_DEFINED(`${property} of availability`))
    }

    if (property === 'status' && typeof resource.availability[property] !== 'string') {
      throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE(`${property} of availability`, 'string'))
    }

    if (
      property === 'date' &&
      resource.availability[property] !== null &&
      typeof resource.availability[property] !== 'string'
    ) {
      throw createError(400, FIELD_CAN_BE_ONE_OF(`${property} of availability`, ['string', 'null']))
    }
  }
}

module.exports = validateCommonFields
