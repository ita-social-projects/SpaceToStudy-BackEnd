const { FIELD_IS_NOT_DEFINED, FIELD_IS_NOT_OF_PROPER_TYPE } = require('~/consts/errors')

const { createError } = require('~/utils/errorsHelper')
const deleteNotAllowedFields = require('~/utils/cooperations/sections/deleteNotAllowedFields')

const answersFields = ['text', 'isCorrect']
const textFields = ['title', 'text']

const validateQuestion = (resource) => {
  for (const field of textFields) {
    if (!resource[field]) {
      throw createError(400, FIELD_IS_NOT_DEFINED(`quiz item ${field}`))
    }

    if (typeof resource[field] !== 'string') {
      throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE(`quiz item ${field}`, 'string'))
    }
  }

  if (!resource.answers) {
    throw createError(400, FIELD_IS_NOT_DEFINED('quiz item answers'))
  }

  validateAnswersFields(resource.answers)
}

const validateAnswersFields = (answers) => {
  if (!Array.isArray(answers)) {
    throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('quiz item answers', 'array'))
  }

  for (const answer of answers) {
    deleteNotAllowedFields(answer, answersFields)

    for (const property of answersFields) {
      if (!(property in answer)) {
        throw createError(400, FIELD_IS_NOT_DEFINED(`${property} of quiz item answers`))
      }

      if (property === 'text' && typeof answer[property] !== 'string') {
        throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE(`${property} of quiz item answers`, 'string'))
      }

      if (property === 'isCorrect' && typeof answer[property] !== 'boolean') {
        throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE(`${property} of quiz item answers`, 'boolean'))
      }
    }
  }
}

module.exports = validateQuestion
