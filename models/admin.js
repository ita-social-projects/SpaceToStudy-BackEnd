const { Schema, model } = require('mongoose')
const {
  enums: { ROLE_ENUM, LANG_ENUM }
} = require('~/consts/validation')

const adminSchema = new Schema({
  role: {
    type: String,
    enum: ROLE_ENUM,
    required: true,
    default: 'admin'
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    select: false
  },
  active: {
    type: Boolean,
    default: false,
    required: true
  },
  blocked: {
    type: Boolean,
    default: false,
    required: true
  },
  signUpDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  language: {
    type: String,
    enum: LANG_ENUM,
    default: LANG_ENUM[0]
  }
})

module.exports = model('Admin', adminSchema)
