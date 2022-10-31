const { Schema, model } = require('mongoose')

const adminInvitationSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  dateOfInvitation: {
    type: Date,
    required: true
  },
})

module.exports = model('AdminInvitation', adminInvitationSchema)
