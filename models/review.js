const { Schema, model } = require('mongoose')

const reviewSchema = new Schema(
  {
    comment: {
      type: String,
      required: false,
      default: null
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
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
  },
  { timestamps: true }
)

module.exports = model('Review', reviewSchema)
