const { Schema, model } = require('mongoose')
const { refs: { ADMIN_INVITATION } } = require('~/consts/models')

const adminInvitationSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  dateOfInvitation: {
    type: Date,
    required: true,
    default: Date.now
  }
})

module.exports = model(ADMIN_INVITATION, adminInvitationSchema)
