const { Schema, model } = require('mongoose')

const userSchema = new Schema({
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
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please enter a password']
  },
  isEmailConfirmed: {
    type: Boolean,
    default: false
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
})

module.exports = model('User', userSchema)
