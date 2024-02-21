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

const googleAuthValidationSchema = {
  token: {
    type: 'object',
    required: true
  },
  role: {
    type: 'string'
  }
}

module.exports = { loginValidationSchema, googleAuthValidationSchema }
