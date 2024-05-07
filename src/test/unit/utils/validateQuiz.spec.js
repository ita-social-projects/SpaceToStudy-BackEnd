const { FIELD_IS_NOT_DEFINED, FIELD_IS_NOT_OF_PROPER_TYPE, FIELD_CAN_BE_ONE_OF } = require('~/consts/errors')
const {
  enums: { RESOURCE_STATUS_ENUM }
} = require('~/consts/validation')

const { createError } = require('~/utils/errorsHelper')
const validateQuiz = require('~/utils/cooperations/sections/validateQuiz')

describe('validateQuiz', () => {
  let resource

  beforeEach(() => {
    resource = {
      title: 'Quiz',
      availability: { status: 'open', date: null },
      settings: {
        view: 'Scroll',
        shuffle: false,
        pointValues: false,
        scoredResponses: false,
        correctAnswers: false
      },
      items: [
        {
          title: 'Title',
          text: 'Text',
          answers: [
            { text: 'Answer 1', isCorrect: true },
            { text: 'Answer 2', isCorrect: false }
          ]
        }
      ],
      status: 'available'
    }
  })

  it('should throw error if settings is not an object', () => {
    resource.settings = 'string'

    const validateFunc = () => validateQuiz(resource)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('quiz settings', 'object')))
  })

  it('should throw error if required settings properties are missing', () => {
    delete resource.settings.shuffle

    const validateFunc = () => validateQuiz(resource)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_DEFINED('shuffle of quiz settings')))
  })

  it('should throw error if settings properties are not boolean', () => {
    resource.settings.pointValues = 'true'

    const validateFunc = () => validateQuiz(resource)

    expect(validateFunc).toThrow(
      createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('pointValues of quiz settings', 'boolean'))
    )
  })

  it('should throw error if items is not an array', () => {
    resource.items = 44

    const validateFunc = () => validateQuiz(resource)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('quiz items', 'array')))
  })

  it('should throw error if status is not valid', () => {
    resource.status = 'invalidStatus'
    delete resource.items

    const validateFunc = () => validateQuiz(resource)

    expect(validateFunc).toThrow(createError(400, FIELD_CAN_BE_ONE_OF('quiz status', RESOURCE_STATUS_ENUM)))
  })

  it('should not throw error if all fields are valid', () => {
    expect(() => validateQuiz(resource)).not.toThrow()
  })
})
