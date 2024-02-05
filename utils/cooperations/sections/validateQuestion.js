const { FIELD_IS_NOT_DEFINED, FIELD_IS_NOT_OF_PROPER_TYPE } = require('~/consts/errors')

const { createError } = require('~/utils/errorsHelper')
const deleteNotAllowedFields = require('~/utils/cooperations/sections/deleteNotAllowedFields')

const answersFields = ['text', 'isCorrect']

const validateQuestion = (resource) => {
  if (!resource.title) {
    throw createError(400, FIELD_IS_NOT_DEFINED('quiz item title'))
  }

  if (typeof resource.title !== 'string') {
    throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('quiz item title', 'string'))
  }

  if (!resource.text) {
    throw createError(400, FIELD_IS_NOT_DEFINED('quiz item text'))
  }

  if (typeof resource.text !== 'string') {
    throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('quiz item text', 'string'))
  }

  if (!resource.answers) {
    throw createError(400, FIELD_IS_NOT_DEFINED('quiz item answers'))
  }

  if (!Array.isArray(resource.answers)) {
    throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('quiz item answers', 'array'))
  }

  for (const answer of resource.answers) {
    deleteNotAllowedFields(answer, answersFields)

    for (const property of answersFields) {
      if (!(property in answer)) {
        throw createError(400, FIELD_IS_NOT_DEFINED(`${property} of quiz item answers`))
      }

      if (property === 'text' && typeof answer[property] !== 'string') {
        throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE(`${property} of quiz item answers`, 'string'))
      }

      if (property === 'isCorrect' && typeof answer[property] !== 'boolean') {
        throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE(`${property} of quiz question answers`, 'boolean'))
      }
    }
  }
}

module.exports = validateQuestion
