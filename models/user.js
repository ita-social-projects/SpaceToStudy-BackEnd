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
  isActivated: {
    type: Boolean,
    default: false
  },
  activationLink: {
    type: String
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  }
})

module.exports = model('User', userSchema)
