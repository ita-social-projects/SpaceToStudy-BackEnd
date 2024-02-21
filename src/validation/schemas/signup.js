const {
  lengths: { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, MAX_NAME_LENGTH, MIN_NAME_LENGTH },
  regex: { EMAIL_PATTERN, PASSWORD_PATTERN, NAME_PATTERN },
  enums: { ROLE_ENUM }
} = require('~/consts/validation')

const signupValidationSchema = {
  firstName: {
    type: 'string',
    required: true,
    regex: NAME_PATTERN,
    length: {
      min: MIN_NAME_LENGTH,
      max: MAX_NAME_LENGTH
    }
  },
  lastName: {
    type: 'string',
    required: true,
    regex: NAME_PATTERN,
    length: {
      min: MIN_NAME_LENGTH,
      max: MAX_NAME_LENGTH
    }
  },
  email: {
    type: 'string',
    required: true,
    regex: EMAIL_PATTERN
  },
  role: {
    type: 'string',
    required: true,
    enum: ROLE_ENUM
  },
  password: {
    type: 'string',
    required: true,
    length: {
      min: MIN_PASSWORD_LENGTH,
      max: MAX_PASSWORD_LENGTH
    },
    regex: PASSWORD_PATTERN
  }
}

module.exports = signupValidationSchema
