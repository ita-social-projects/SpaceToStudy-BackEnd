const { Schema, model } = require('mongoose')
const { FIELD_CANNOT_BE_EMPTY } = require('~/consts/errors')
const { CATEGORY, SUBJECT } = require('~/consts/models')

const subjectSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, FIELD_CANNOT_BE_EMPTY('name')]
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: CATEGORY,
      required: [true, FIELD_CANNOT_BE_EMPTY('category')]
    },
    totalOffers: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true, versionKey: false }
)

module.exports = model(SUBJECT, subjectSchema)
