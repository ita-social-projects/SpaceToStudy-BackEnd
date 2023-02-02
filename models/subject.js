const { Schema, model } = require('mongoose')

const subjectSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'Please, enter a subject name']
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please, choose a subject category']
    },
    totalOffers: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

module.exports = model('Subject', subjectSchema)
