const { Schema, model } = require('mongoose')
const { QUIZ, USER, CATEGORY, QUESTION } = require('~/consts/models')
const { FIELD_CANNOT_BE_EMPTY, FIELD_CANNOT_BE_LONGER, FIELD_CANNOT_BE_SHORTER } = require('~/consts/errors')

const quizSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('title')],
      minLength: [1, FIELD_CANNOT_BE_SHORTER('title', 1)],
      maxLength: [100, FIELD_CANNOT_BE_LONGER('title', 100)]
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
      type: [Schema.Types.ObjectId],
      ref: CATEGORY
    }
  },
  { timestamps: true, versionKey: false }
)

module.exports = model(QUIZ, quizSchema)
