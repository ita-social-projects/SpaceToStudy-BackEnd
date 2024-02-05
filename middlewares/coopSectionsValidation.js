const { QUIZ, LESSON, ATTACHMENT } = require('~/consts/models')
const { FIELD_IS_NOT_OF_PROPER_TYPE } = require('~/consts/errors')

const { createError } = require('~/utils/errorsHelper')
const validateAttachment = require('~/utils/cooperations/sections/validateAttachment')
const validateLesson = require('~/utils/cooperations/sections/validateLesson')
const validateQuiz = require('~/utils/cooperations/sections/validateQuiz')
const deleteNotAllowedFields = require('~/utils/cooperations/sections/deleteNotAllowedFields')

const resourceAllowedFields = [
  'title',
  'description',
  'availability',
  'content',
  'link',
  'settings',
  'attachments',
  'items',
  'status'
]

const coopSectionsValidation = (req, _res, next) => {
  const { sections } = req.body

  if (sections) {
    for (const section of sections) {
      if (Array.isArray(section.activities)) {
        for (const activity of section.activities) {
          if (typeof activity.resource !== 'object' || Array.isArray(activity.resource)) {
            throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('activity resource', 'object'))
          } else {
            deleteNotAllowedFields(activity.resource, resourceAllowedFields)

            switch (activity.resourceType) {
              case QUIZ:
                validateQuiz(activity.resource)
                break
              case LESSON:
                validateLesson(activity.resource)
                break
              case ATTACHMENT:
                validateAttachment(activity.resource)
                break
            }
          }
        }
      }
    }
  }

  next()
}

module.exports = coopSectionsValidation
