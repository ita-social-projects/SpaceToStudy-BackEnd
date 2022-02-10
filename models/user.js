const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { roles: { STUDENT, TEACHER, ADMIN } } = require('../consts/index');

const userSchema = new Schema(
  {
    role: {
        type: String,
        enum: [STUDENT, TEACHER, ADMIN],
        required: true,
        default: STUDENT
    },
    email: {
        type: String,
        required: true
    },
    password: {
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
