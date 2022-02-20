// will be replaced with Nelia's model
const mongoose = require('mongoose')
// const bcrypt = require('bcrypt')

const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    role: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, 'Please enter an email'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
    }
  }
)

// userSchema.pre('save', async function (next) {
//   const salt = await bcrypt.genSalt()
//   this.password = await bcrypt.hash(this.password, salt)
//   next()
// }) 

module.exports = mongoose.model('User', userSchema)
