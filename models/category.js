const { Schema, model } = require('mongoose')
const categories = require('~/consts/categories')

const categorySchema = new Schema({
  name: {
    type: String,
    enum: Object.values(categories),
    unique: true,
    required: true
  }
})

module.exports = model('Category', categorySchema)
