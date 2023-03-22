const { Schema, model } = require('mongoose')
const { USER, TOKEN } = require('~/consts/models')

const tokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: USER
  },
  refreshToken: {
    type: String,
    required: false
  },
  resetToken: {
    type: String,
    required: false,
    default: null
  },
  confirmToken: {
    type: String,
    required: false
  }
})

module.exports = model(TOKEN, tokenSchema)
