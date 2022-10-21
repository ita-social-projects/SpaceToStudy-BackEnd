const { Schema, model } = require('mongoose')
const {
  enums: { CATEGORY_ENUM }
} = require('~/consts/validation')

const categorySchema = new Schema({
  name: {
    type: String,
    enum: CATEGORY_ENUM,
    unique: true,
    required: true
  }
})

module.exports = model('Category', categorySchema)
