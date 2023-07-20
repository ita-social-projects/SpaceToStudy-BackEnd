const { Schema, model } = require('mongoose')
const { CATEGORY, SUBJECT } = require('~/consts/models')

const subjectSchema = new Schema(
  {
    name: {
      type: String,
      unique: true
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: CATEGORY
    },
    totalOffers: {
      student: {
        type: Number,
        default: 0
      },
      tutor: {
        type: Number,
        default: 0
      }
    }
  },
  { timestamps: true, versionKey: false }
)

subjectSchema.index({ name: 1 }, { unique: true })

module.exports = model(SUBJECT, subjectSchema)
