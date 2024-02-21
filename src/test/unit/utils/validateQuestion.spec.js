const { FIELD_IS_NOT_DEFINED, FIELD_IS_NOT_OF_PROPER_TYPE } = require('~/consts/errors')

const { createError } = require('~/utils/errorsHelper')
const validateQuestion = require('~/utils/cooperations/sections/validateQuestion')

describe('validateQuestion', () => {
  let resource

  beforeEach(() => {
    resource = {
      title: 'Title',
      text: 'Text',
      answers: [
        { text: 'Answer 1', isCorrect: true },
        { text: 'Answer 2', isCorrect: false }
      ]
    }
  })

  it('should throw error if title is not defined', () => {
    delete resource.title

    const validateFunc = () => validateQuestion(resource)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_DEFINED('quiz item title')))
  })

  it('should throw error if title is not a string', () => {
    resource.title = 44

    const validateFunc = () => validateQuestion(resource)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('quiz item title', 'string')))
  })

  it('should throw error if answers is not defined', () => {
    delete resource.answers

    const validateFunc = () => validateQuestion(resource)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_DEFINED('quiz item answers')))
  })

  it('should throw error if answers is not an array', () => {
    resource.answers = 'string'

    const validateFunc = () => validateQuestion(resource)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('quiz item answers', 'array')))
  })

  it('should throw error if answer text is not defined', () => {
    delete resource.answers[0].text

    const validateFunc = () => validateQuestion(resource)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_DEFINED('text of quiz item answers')))
  })

  it('should throw error if answer text is not a string', () => {
    resource.answers[0].text = 123

    const validateFunc = () => validateQuestion(resource)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('text of quiz item answers', 'string')))
  })

  it('should throw error if answer isCorrect is not a boolean', () => {
    resource.answers[1].isCorrect = 'true'

    const validateFunc = () => validateQuestion(resource)

    expect(validateFunc).toThrow(
      createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('isCorrect of quiz item answers', 'boolean'))
    )
  })
})
