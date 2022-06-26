const mongoose = require('mongoose')
const {
  roles: { STUDENT, MENTOR, ADMIN }
} = require('~/consts/auth')
const {
  errorCodes: { ROLE_NOT_SUPPORTED }
} = require('~/consts/errors')

const Schema = mongoose.Schema

const userSchema = new Schema({
  role: {
    type: String,
    enum: {
      values: [STUDENT, MENTOR, ADMIN],
      message: ROLE_NOT_SUPPORTED
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
  }
})

module.exports = mongoose.model('User', userSchema)
