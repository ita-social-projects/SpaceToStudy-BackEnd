const {
  lengths: { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH },
  regex: { PASSWORD_PATTERN }
} = require('~/app/consts/validation')

const resetPasswordValidationSchema = {
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

module.exports = resetPasswordValidationSchema
