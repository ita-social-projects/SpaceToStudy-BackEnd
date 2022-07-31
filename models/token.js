const { Schema, model } = require('mongoose')

const tokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  refreshToken: {
    type: String,
    required: true
  },
  resetToken: {
    type: String,
    required: false,
    default: null
  }
})

module.exports = model('Token', tokenSchema)
