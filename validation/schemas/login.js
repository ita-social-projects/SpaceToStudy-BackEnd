const {
  lengths: { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH },
  regex: { EMAIL_PATTERN, PASSWORD_PATTERN }
} = require('~/consts/validation')

const loginValidationSchema = {
  email: {
    type: 'string',
    required: true,
    regex: EMAIL_PATTERN
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

module.exports = loginValidationSchema
