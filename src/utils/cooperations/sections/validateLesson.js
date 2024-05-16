const { FIELD_IS_NOT_DEFINED, FIELD_IS_NOT_OF_PROPER_TYPE, FIELD_CAN_BE_ONE_OF } = require('~/consts/errors')
const { LESSON } = require('~/consts/models')
const {
  enums: { RESOURCE_STATUS_ENUM }
} = require('~/consts/validation')
const { createError } = require('~/utils/errorsHelper')
const validateCommonFields = require('~/utils/cooperations/sections/validateCommonFields')
const deleteNotAllowedFields = require('./deleteNotAllowedFields')

const allowedFields = ['_id', 'title', 'description', 'availability', 'attachments', 'content', 'status']

const validateLesson = (resource) => {
  deleteNotAllowedFields(resource, allowedFields)
  validateCommonFields(resource, LESSON)

  if (!resource.content) {
    throw createError(400, FIELD_IS_NOT_DEFINED('lesson content'))
  }

  if (typeof resource.content !== 'string') {
    throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('lesson content', 'string'))
  }

  if (resource.attachments) {
    if (!Array.isArray(resource.attachments)) {
      throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('lesson attachments', 'array'))
    }
  }

  if (resource.status && !RESOURCE_STATUS_ENUM.includes(resource.status)) {
    throw createError(400, FIELD_CAN_BE_ONE_OF('lesson status', RESOURCE_STATUS_ENUM))
  }
}

module.exports = validateLesson
