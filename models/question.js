const { Schema, model } = require('mongoose')

const { QUESTION, USER } = require('~/consts/models')
const { FIELD_CANNOT_BE_EMPTY, FIELD_CANNOT_BE_LONGER, FIELD_CANNOT_BE_SHORTER } = require('~/consts/errors')

const questionSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('title')],
      minLength: [1, FIELD_CANNOT_BE_SHORTER('title', 1)],
      maxLength: [100, FIELD_CANNOT_BE_LONGER('title', 100)]
    },
    answers: [
      {
        _id: false,
        text: {
          type: String,
          required: [true, FIELD_CANNOT_BE_EMPTY('answer')],
          minLength: [1, FIELD_CANNOT_BE_SHORTER('answer', 1)],
          maxLength: [150, FIELD_CANNOT_BE_LONGER('answer', 150)]
        },
        isCorrect: {
          type: Boolean,
          default: false,
          required: true
        }
      }
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('author')]
    }
  },
  { timestamps: true, versionKey: false }
)

module.exports = model(QUESTION, questionSchema)
