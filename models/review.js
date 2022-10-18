const { Schema, model } = require('mongoose')

const reviewSchema = new Schema({
  comment: {
    type: String,
    required: false,
    default: null
  },
  rating: {
    type: Number,
    required: true
  },
  tutor: {
    type: Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  }
})

module.exports = model('Review', reviewSchema)
