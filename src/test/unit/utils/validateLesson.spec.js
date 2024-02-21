const { FIELD_IS_NOT_DEFINED, FIELD_IS_NOT_OF_PROPER_TYPE, FIELD_CAN_BE_ONE_OF } = require('~/consts/errors')
const {
  enums: { RESOURCE_STATUS_ENUM }
} = require('~/consts/validation')

const { createError } = require('~/utils/errorsHelper')
const validateLesson = require('~/utils/cooperations/sections/validateLesson')

describe('validateLesson', () => {
  let resource

  beforeEach(() => {
    resource = {
      title: 'Title',
      content: '<h2>Content</h2>',
      status: 'available',
      availability: { status: 'open', date: null },
      attachments: [
        { title: 'F1.png', link: '343533-F1.png', availability: { status: 'open', date: null } },
        { title: 'F2.png', link: '324124-F2.png', availability: { status: 'open', date: null } }
      ]
    }
  })

  it('should throw error if content is not defined', () => {
    delete resource.content

    const validateFunc = () => validateLesson(resource)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_DEFINED('lesson content')))
  })

  it('should throw error if content is not a string', () => {
    resource.content = 123

    const validateFunc = () => validateLesson(resource)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('lesson content', 'string')))
  })

  it('should throw error if attachments is not an array', () => {
    resource.attachments = {}

    const validateFunc = () => validateLesson(resource)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('lesson attachments', 'array')))
  })

  it('should throw error if status is not valid', () => {
    resource.status = 'invalidStatus'

    const validateFunc = () => validateLesson(resource)

    expect(validateFunc).toThrow(createError(400, FIELD_CAN_BE_ONE_OF('lesson status', RESOURCE_STATUS_ENUM)))
  })

  it('should not throw error if all fields are valid', () => {
    delete resource.attachments

    const validateFunc = () => validateLesson(resource)

    expect(validateFunc).not.toThrow()
  })
})
