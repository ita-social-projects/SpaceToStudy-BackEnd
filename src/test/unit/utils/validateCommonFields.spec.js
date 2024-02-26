const { FIELD_IS_NOT_DEFINED, FIELD_IS_NOT_OF_PROPER_TYPE, FIELD_CAN_BE_ONE_OF } = require('~/consts/errors')
const { QUIZ } = require('~/consts/models')
const {
  enums: { RESOURCE_AVAILABILITY_STATUS_ENUM }
} = require('~/consts/validation')

const { createError } = require('~/utils/errorsHelper')
const validateCommonFields = require('~/utils/cooperations/sections/validateCommonFields')

jest.mock('~/utils/errorsHelper')

describe('validateCommonFields', () => {
  let resource

  beforeEach(() => {
    resource = {
      title: 'Sample Title',
      description: 'Sample Description',
      availability: { status: 'open', date: null }
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should throw error if required fields are missing', () => {
    delete resource.title

    const validateFunc = () => validateCommonFields(resource, QUIZ)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_DEFINED('Quiz title')))
  })

  it('should throw error if title is not a string', () => {
    resource.title = 123

    const validateFunc = () => validateCommonFields(resource, QUIZ)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('Quiz title', 'string')))
  })

  it('should throw error if description is not a string', () => {
    resource.description = 123

    const validateFunc = () => validateCommonFields(resource, QUIZ)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('Quiz description', 'string')))
  })

  it('should throw error if availability is not an object', () => {
    resource.availability = 'string'

    const validateFunc = () => validateCommonFields(resource, QUIZ)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('Quiz availability', 'object')))
  })

  it('should throw error if required availability fields are missing', () => {
    delete resource.availability.status

    const validateFunc = () => validateCommonFields(resource, QUIZ)

    expect(validateFunc).toThrow(createError(400, FIELD_IS_NOT_DEFINED('status of Quiz availability')))
  })

  it('should throw error if availability status is not valid', () => {
    resource.availability.status = 'invalidStatus'

    const validateFunc = () => validateCommonFields(resource, QUIZ)

    expect(validateFunc).toThrow(
      createError(400, FIELD_CAN_BE_ONE_OF('status of Quiz availability', RESOURCE_AVAILABILITY_STATUS_ENUM))
    )
  })

  it('should throw error if availability date is not a string or null', () => {
    resource.availability.date = 123

    const validateFunc = () => validateCommonFields(resource, QUIZ)

    expect(validateFunc).toThrow(createError(400, FIELD_CAN_BE_ONE_OF('date of Quiz availability', ['string', 'null'])))
  })
})
