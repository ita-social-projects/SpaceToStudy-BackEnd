const { Schema, model } = require('mongoose')

const categorySchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  }
})

module.exports = model('Category', categorySchema)
