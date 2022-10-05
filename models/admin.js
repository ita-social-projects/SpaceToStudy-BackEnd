const { Schema, model } = require('mongoose')
const {
  enums: { ADMIN_STATUS_ENUM }
} = require('~/consts/validation')

const adminSchema = new Schema({
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true
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
    required: true
  },
  photo: {
    type: String
  },
  status: {
    type: String,
    enum: ADMIN_STATUS_ENUM,
    default: 'pending'
  },
  dateOfInvitation: {
    type: Date,
    required: true
  },
  dateOfActivation: {
    type: Date,
    required: true
  },
  lastLogin: {
    type: Date,
    required: true
  }
})

module.exports = model('Admin', adminSchema)
