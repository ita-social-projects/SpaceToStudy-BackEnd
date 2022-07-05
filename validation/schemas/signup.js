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
      min: 8,
      max: 25
    }
  }
}

module.exports = signupValidationSchema
