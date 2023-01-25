const { Schema, model } = require('mongoose')
const {
  enums: { SUBJECT_LEVEL_ENUM }
} = require('~/consts/validation')

const subjectSchema = new Schema({
  tutorId: {
    type: Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please, enter a subject name']
  },
  price: {
    type: Number,
    min: [0, 'Price should be greater than 0'],
    required: [true, 'Please, enter a subject price']
  },
  proficiencyLevel: {
    type: String,
    enum: SUBJECT_LEVEL_ENUM,
    required: [true, 'Please, choose a subject proficiency level']
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please, choose a subject category']
  }
})

module.exports = model('Subject', subjectSchema)
