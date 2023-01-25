const { Schema, model } = require('mongoose')
const {
  enums: { ROLE_ENUM }
} = require('~/consts/validation')

const adminSchema = new Schema({
  role: {
    type: String,
    enum: ROLE_ENUM,
    required: true,
    default: 'admin'
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
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
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
    required: true
  },
  lastLogin: {
    type: Date,
    required: true
  }
})

module.exports = model('Admin', adminSchema)
