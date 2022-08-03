const {
  passwords: { MIN_LENGTH, MAX_LENGTH }
} = require('~/consts/utils')

const signupValidationSchema = {
  firstName: {
    type: 'string',
    required: true
  },
  lastName: {
    type: 'string',
    required: true
  },
  email: {
    type: 'string',
    required: true
  },
  role: {
    type: 'string',
    required: true
  },
  password: {
    type: 'string',
    required: true,
    length: {
      min: MIN_LENGTH,
      max: MAX_LENGTH
    }
  }
}

module.exports = signupValidationSchema
