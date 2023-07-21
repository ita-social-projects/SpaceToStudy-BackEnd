const { Schema, model } = require('mongoose')
const { QUIZ } = require('~/consts/models')
const { FIELD_CANNOT_BE_EMPTY, FIELD_CANNOT_BE_LONGER, FIELD_CANNOT_BE_SHORTER } = require('~/consts/errors')

const quizSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('title')],
      minLength: [1, FIELD_CANNOT_BE_SHORTER('title', 1)],
      maxLength: [100, FIELD_CANNOT_BE_LONGER('title', 100)]
    },
    items: [
      {
        _id: false,
        question: {
          type: String,
          required: [true, FIELD_CANNOT_BE_EMPTY('question')],
          minLength: [1, FIELD_CANNOT_BE_SHORTER('question', 1)],
          maxLength: [150, FIELD_CANNOT_BE_LONGER('question', 150)]
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
            correct: {
              type: Boolean,
              required: true
            }
          }
        ]
      }
    ]
  },
  { timestamps: true, versionKey: false }
)

module.exports = model(QUIZ, quizSchema)
