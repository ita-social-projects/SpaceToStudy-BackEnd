const { Schema, model } = require('mongoose')
const { QUIZ, FINISHED_QUIZ } = require('~/app/consts/models')
const {
  FIELD_CANNOT_BE_EMPTY,
  FIELD_CANNOT_BE_SHORTER,
  FIELD_CANNOT_BE_LONGER,
  VALUE_MUST_BE_ABOVE,
  VALUE_MUST_BE_BELOW
} = require('~/app/consts/errors')

const finishedQuizSchema = new Schema(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: QUIZ,
      required: [true, FIELD_CANNOT_BE_EMPTY('quiz')]
    },
    grade: {
      type: Number,
      required: [true, FIELD_CANNOT_BE_EMPTY('grade')],
      min: [0, VALUE_MUST_BE_ABOVE('grade', 0)],
      max: [100, VALUE_MUST_BE_BELOW('grade', 100)]
    },
    results: [
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
            isCorrect: {
              type: Boolean,
              required: true
            },
            isChosen: {
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

module.exports = model(FINISHED_QUIZ, finishedQuizSchema)
