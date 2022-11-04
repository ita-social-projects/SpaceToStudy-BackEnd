const { Schema, model } = require('mongoose')
const {
  enums: { ROLE_ENUM, LANG_ENUM }
} = require('~/consts/validation')

const studentSchema = new Schema({
  role: {
    type: String,
    enum: ROLE_ENUM,
    required: true,
    default: 'student'
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
    required: [true, 'Please enter a password'],
    select: false
  },
  photo: {
    type: String
  },
  isEmailConfirmed: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  active: {
    type: Boolean,
    default: true,
    required: true,
    select: false
  },
  blocked: {
    type: Boolean,
    default: false,
    required: true,
    select: false
  },
  language: {
    type: String,
    enum: LANG_ENUM,
    default: LANG_ENUM[0]
  }
})

module.exports = model('Student', studentSchema)
