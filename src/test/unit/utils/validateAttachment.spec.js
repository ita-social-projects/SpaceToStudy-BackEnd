const { FIELD_IS_NOT_DEFINED, FIELD_IS_NOT_OF_PROPER_TYPE } = require('~/consts/errors')

const { createError } = require('~/utils/errorsHelper')
const validateAttachment = require('~/utils/cooperations/sections/validateAttachment')

describe('validateAttachment', () => {
  let resource

  beforeEach(() => {
    resource = {
      title: 'attachment.jpg',
      availability: { status: 'open', date: null },
      link: '434054054-attachment.jpg'
    }
  })

  it('should throw error if link is not defined', () => {
    delete resource.link

    const validateFunc = () => validateAttachment(resource)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_DEFINED('lesson attachment link')))
  })

  it('should throw error if link is not a string', () => {
    resource.link = 123

    const validateFunc = () => validateAttachment(resource)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('lesson attachment link', 'string')))
  })

  it('should not throw error if link is defined and of string type', () => {
    expect(() => validateAttachment(resource)).not.toThrow()
  })
})
