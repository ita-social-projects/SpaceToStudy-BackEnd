const { Schema, model } = require('mongoose')

const roleSchema = new Schema({
  value: {
    type: String,
    unique: true,
    required: true
  }
})

module.exports = model('Role', roleSchema)
