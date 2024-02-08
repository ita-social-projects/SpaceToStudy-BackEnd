const {
  regex: { EMAIL_PATTERN }
} = require('~/app/consts/validation')

const forgotPasswordValidationSchema = {
  email: {
    type: 'string',
    required: true,
    regex: EMAIL_PATTERN
  }
}

module.exports = forgotPasswordValidationSchema
