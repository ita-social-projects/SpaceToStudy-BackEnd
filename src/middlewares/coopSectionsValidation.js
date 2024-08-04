const { FIELD_IS_NOT_OF_PROPER_TYPE } = require('~/consts/errors')
const {
  enums: { RESOURCES_TYPES_ENUM }
} = require('~/consts/validation')

const { createError } = require('~/utils/errorsHelper')
const validateAttachment = require('~/utils/cooperations/sections/validateAttachment')
const validateLesson = require('~/utils/cooperations/sections/validateLesson')
const validateQuiz = require('~/utils/cooperations/sections/validateQuiz')
const deleteNotAllowedFields = require('~/utils/cooperations/sections/deleteNotAllowedFields')

const resourcesAllowedFields = ['resourceType', 'resource']

const coopSectionsValidation = (req, _res, next) => {
  const { sections } = req.body
  if (sections) {
    for (const section of sections) {
      if (section.resources && Array.isArray(section.resources)) {
        for (const resource of section.resources) {
          validateResource(resource)
        }
      }
    }
  }

  next()
}

const validateResource = (item) => {
  if (typeof item.resource !== 'object' || Array.isArray(item.resource)) {
    throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('resource', 'object'))
  }
  deleteNotAllowedFields(item, resourcesAllowedFields)

  switch (item.resourceType) {
    case RESOURCES_TYPES_ENUM[0]:
      validateLesson(item.resource)
      break
    case RESOURCES_TYPES_ENUM[1]:
      validateQuiz(item.resource)
      break
    case RESOURCES_TYPES_ENUM[2]:
      validateAttachment(item.resource)
      break
  }
}

module.exports = coopSectionsValidation
