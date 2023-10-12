const { Schema, model } = require('mongoose')
const { QUIZ, USER, RESOURCES_CATEGORY, QUESTION } = require('~/consts/models')
const { FIELD_CANNOT_BE_EMPTY, FIELD_CANNOT_BE_LONGER, FIELD_CANNOT_BE_SHORTER } = require('~/consts/errors')

const quizSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('title')],
      minLength: [1, FIELD_CANNOT_BE_SHORTER('title', 1)],
      maxLength: [100, FIELD_CANNOT_BE_LONGER('title', 100)]
    },
    description: {
      type: String,
      maxLength: [150, FIELD_CANNOT_BE_LONGER('description', 150)],
      trim: true
    },
    items: {
      type: [Schema.Types.ObjectId],
      ref: QUESTION,
      required: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('author')]
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: RESOURCES_CATEGORY,
      default: null
    }
  },
  { timestamps: true, versionKey: false }
)

module.exports = model(QUIZ, quizSchema)
