const { FIELD_IS_NOT_DEFINED, FIELD_IS_NOT_OF_PROPER_TYPE } = require('~/consts/errors')
const { ATTACHMENT } = require('~/consts/models')

const { createError } = require('~/utils/errorsHelper')
const validateCommonFields = require('~/utils/cooperations/sections/validateCommonFields')
const deleteNotAllowedFields = require('./deleteNotAllowedFields')

const allowedFields = ['_id', 'fileName', 'link', 'availability', 'size']

const validateAttachment = (resource) => {
  deleteNotAllowedFields(resource, allowedFields)
  validateCommonFields(resource, ATTACHMENT, ['fileName', 'link'])

  if (!resource.link) {
    throw createError(400, FIELD_IS_NOT_DEFINED('lesson attachment link'))
  }

  if (typeof resource.link !== 'string') {
    throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('lesson attachment link', 'string'))
  }
}

module.exports = validateAttachment
