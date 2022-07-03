const { Schema, model } = require('mongoose')
const {
  roles: { STUDENT, MENTOR, ADMIN }
} = require('~/consts/auth')
const { ROLE_NOT_SUPPORTED } = require('~/consts/errors')

const userSchema = new Schema({
  role: {
    type: String,
    enum: {
      values: [STUDENT, MENTOR, ADMIN],
      message: ROLE_NOT_SUPPORTED.code
    },
    required: true,
    default: STUDENT
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please enter a password']
  },
  isActivated: {
    type: Boolean,
    default: false
  },
  activationLink: {
    type: String
  }
})

module.exports = model('User', userSchema)
