const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: [USER, TEACHER, ADMIN, SUPERADMIN],
        default: USER,
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: false
    }
  }
)

module.exports = mongoose.model('User', userSchema)
