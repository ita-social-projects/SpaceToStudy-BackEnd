const { Schema, model } = require('mongoose')
const { refs: { CATEGORY } } = require('~/consts/models')

const subjectSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'Please, enter a subject name']
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: CATEGORY,
      required: [true, 'Please, choose a subject category']
    },
    totalOffers: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true, versionKey: false }
)

module.exports = model('Subject', subjectSchema)
