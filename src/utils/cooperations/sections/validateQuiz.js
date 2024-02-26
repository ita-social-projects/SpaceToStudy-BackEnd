const { FIELD_IS_NOT_DEFINED, FIELD_IS_NOT_OF_PROPER_TYPE, FIELD_CAN_BE_ONE_OF } = require('~/consts/errors')
const { QUIZ } = require('~/consts/models')
const {
  enums: { RESOURCE_STATUS_ENUM, QUIZ_SETTINGS_ENUM }
} = require('~/consts/validation')

const { createError } = require('~/utils/errorsHelper')
const deleteNotAllowedFields = require('~/utils/cooperations/sections/deleteNotAllowedFields')
const validateCommonFields = require('~/utils/cooperations/sections/validateCommonFields')
const validateQuestion = require('~/utils/cooperations/sections/validateQuestion')

const validateQuiz = (resource) => {
  validateCommonFields(resource, QUIZ)

  if (typeof resource.settings !== 'object' || Array.isArray(resource.settings)) {
    throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('quiz settings', 'object'))
  }

  deleteNotAllowedFields(resource.settings, QUIZ_SETTINGS_ENUM)

  for (const property of QUIZ_SETTINGS_ENUM) {
    if (!(property in resource.settings)) {
      throw createError(400, FIELD_IS_NOT_DEFINED(`${property} of quiz settings`))
    }

    if (typeof resource.settings[property] !== 'boolean') {
      throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE(`${property} of quiz settings`, 'boolean'))
    }
  }

  if (resource.items) {
    if (!Array.isArray(resource.items)) {
      throw createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('quiz items', 'array'))
    }

    for (const question of resource.items) {
      validateQuestion(question)
    }
  }

  if (resource.status && !RESOURCE_STATUS_ENUM.includes(resource.status)) {
    throw createError(400, FIELD_CAN_BE_ONE_OF('quiz status', RESOURCE_STATUS_ENUM))
  }
}

module.exports = validateQuiz
