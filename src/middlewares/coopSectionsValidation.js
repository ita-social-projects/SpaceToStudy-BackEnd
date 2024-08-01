const { LESSON, QUIZ, ATTACHMENT } = require('~/consts/models')
const { FIELD_IS_NOT_OF_PROPER_TYPE } = require('~/consts/errors')

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
    case LESSON:
      validateLesson(item.resource)
      break
    case QUIZ:
      validateQuiz(item.resource)
      break
    case ATTACHMENT:
      validateAttachment(item.resource)
      break
  }
}

module.exports = coopSectionsValidation
