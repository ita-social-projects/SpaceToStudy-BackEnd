const { Schema, model } = require('mongoose')
const {
  enums: { LANG_LEVEL_ENUM }
} = require('~/consts/validation')

const subjectSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  proficiencyLevel: {
    type: String,
    enum: LANG_LEVEL_ENUM,
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }
})

module.exports = model('Subject', subjectSchema)
