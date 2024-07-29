const { QUIZZES, LESSONS, ATTACHMENTS } = require('~/consts/models')
const { FIELD_IS_NOT_OF_PROPER_TYPE } = require('~/consts/errors')

const { createError } = require('~/utils/errorsHelper')
const validateAttachment = require('~/utils/cooperations/sections/validateAttachment')
const validateLesson = require('~/utils/cooperations/sections/validateLesson')
const validateQuiz = require('~/utils/cooperations/sections/validateQuiz')
const deleteNotAllowedFields = require('~/utils/cooperations/sections/deleteNotAllowedFields')

const activityAllowedFields = ['resourceType', 'resource']

const coopSectionsValidation = (req, _res, next) => {
  const { sections } = req.body
  if (sections) {
    for (const section of sections) {
      if (section.activities && Array.isArray(section.activities)) {
        for (const activity of section.activities) {
          validateActivity(activity)
        }
      }
    }
  }

  next()
}

const validateActivity = (activity) => {
  if (typeof activity.resource !== 'object' || Array.isArray(activity.resource)) {
    throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('activity resource', 'object'))
  }
  deleteNotAllowedFields(activity, activityAllowedFields)

  switch (activity.resourceType) {
    case QUIZZES:
      validateQuiz(activity.resource)
      break
    case LESSONS:
      validateLesson(activity.resource)
      break
    case ATTACHMENTS:
      validateAttachment(activity.resource)
      break
  }
}

module.exports = coopSectionsValidation
