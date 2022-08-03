const {
  passwords: { MIN_LENGTH, MAX_LENGTH }
} = require('~/consts/utils')

const resetPasswordValidationSchema = {
  resetToken: {
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

module.exports = resetPasswordValidationSchema
