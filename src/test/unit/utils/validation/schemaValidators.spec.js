const { validateSchema } = require('~/utils/validation/schemaValidators')
const { validateRequired, validateNonEmptyObject, fieldValidator } = require('~/utils/validation/fieldValidators')
const { isExpectedType } = require('~/utils/validation/typeHelpers')

const FAQSchema = {
  FAQ: {
    type: 'object',
    required: false,
    properties: {
      question: { type: 'string', required: true },
      answer: { type: 'string', required: true }
    }
  }
}

const isRequired = true

jest.mock('~/utils/validation/fieldValidators')
jest.mock('~/utils/validation/typeHelpers')

describe('schemaValidators', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call validateRequired for each schema field', () => {
    const schema = {
      firstName: { required: true },
      lastName: { required: false }
    }
    const data = {
      firstName: 'John',
      lastName: 'Doe'
    }

    validateSchema(schema, data)

    expect(validateRequired).toHaveBeenCalledWith('firstName', true, 'John')
    expect(validateRequired).toHaveBeenCalledWith('lastName', false, 'Doe')
  })

  it('should validate primitive schema fields', () => {
    const schema = {
      firstName: { type: 'string' }
    }
    const data = {
      firstName: 'John'
    }

    validateSchema(schema, data)

    expect(fieldValidator.type).toHaveBeenCalledWith('firstName', 'string', 'John')
  })

  it('should handle validation of empty string', () => {
    const schema = {
      photo: { type: ['object', 'string'] }
    }
    const data = {
      photo: ''
    }

    validateSchema(schema, data)

    expect(fieldValidator.type).toHaveBeenCalledWith('photo', ['object', 'string'], '')
  })

  it('should validate object schema fields', () => {
    const data = {
      FAQ: {
        question: 'Do you have any certificates?',
        answer: 'Yes. You can find them on my LinkedIn profile.'
      }
    }
    isExpectedType.mockReturnValue(true)

    validateSchema(FAQSchema, data)

    expect(validateNonEmptyObject).toHaveBeenCalledWith(data.FAQ, 'FAQ')
    expect(validateRequired).toHaveBeenCalledWith('question', isRequired, 'Do you have any certificates?')
    expect(fieldValidator.type).toHaveBeenCalledWith('question', 'string', 'Do you have any certificates?')
  })

  it('should validate required for fields in nested object if nested object provided', () => {
    const data = {
      FAQ: {
        question: 'Do you have any certificates?'
      }
    }

    isExpectedType.mockReturnValue(true)

    validateSchema(FAQSchema, data)

    expect(validateRequired).toHaveBeenCalledWith('answer', isRequired, undefined)
  })

  it('should not validate required for fields in nested object if nested object is not provided', () => {
    const schema = {
      firstName: { type: 'string', required: true },
      FAQ: FAQSchema.FAQ
    }
    const data = {
      firstName: 'John'
    }

    isExpectedType.mockReturnValue(true)

    validateSchema(schema, data)

    expect(validateRequired).toHaveBeenCalledTimes(2)
    expect(validateRequired).toHaveBeenCalledWith('firstName', isRequired, 'John')
    expect(validateRequired).toHaveBeenCalledWith('FAQ', !isRequired, undefined)
  })

  it('should validate array schema fields', () => {
    const schema = {
      lessons: {
        type: 'array',
        required: true,
        items: { type: 'string' }
      }
    }
    const data = {
      lessons: ['design', 'math']
    }

    isExpectedType.mockReturnValue(true)

    validateSchema(schema, data)

    expect(fieldValidator.type).toHaveBeenCalledWith('lessons array item', 'string', 'design')
    expect(fieldValidator.type).toHaveBeenCalledWith('lessons array item', 'string', 'math')
  })
})
