const { FIELD_IS_NOT_DEFINED, FIELD_IS_NOT_OF_PROPER_TYPE, FIELD_CAN_BE_ONE_OF } = require('~/consts/errors')
const {
  enums: { RESOURCE_STATUS_ENUM }
} = require('~/consts/validation')
const { createError } = require('~/utils/errorsHelper')
const validateCommonFields = require('~/utils/cooperations/sections/validateCommonFields')
const validateAttachment = require('~/utils/cooperations/sections/validateAttachment')

const validateLesson = (resource) => {
  validateCommonFields(resource)

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

    for (const attachment of resource.attachments) {
      validateAttachment(attachment)
    }
  }

  if (resource.status && !RESOURCE_STATUS_ENUM.includes(resource.status)) {
    throw createError(400, FIELD_CAN_BE_ONE_OF('lesson status', RESOURCE_STATUS_ENUM))
  }
}

module.exports = validateLesson
