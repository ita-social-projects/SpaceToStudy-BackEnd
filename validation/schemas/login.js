const loginValidationSchema = {
  email: {
    type: 'string',
    required: true
  },
  password: {
    type: 'string',
    required: true
  }
}

module.exports = loginValidationSchema
