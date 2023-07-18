const { Schema, model } = require('mongoose')
const { ASSESSMENT } = require('~/consts/models')
const { FIELD_CANNOT_BE_EMPTY, FIELD_CANNOT_BE_LONGER, FIELD_CANNOT_BE_SHORTER } = require('~/consts/errors')

const assessmentSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('assessment name')],
      minLength: [1, FIELD_CANNOT_BE_SHORTER('assessment name', 1)],
      maxLength: [100, FIELD_CANNOT_BE_LONGER('assessment name', 100)]
    },
    questions: [
      {
        text: {
          type: String,
          required: [true, FIELD_CANNOT_BE_EMPTY('question')],
          minLength: [1, FIELD_CANNOT_BE_SHORTER('question', 1)],
          maxLength: [150, FIELD_CANNOT_BE_LONGER('question', 150)]
        },
        answers: {
          type: [String],
          required: [true, FIELD_CANNOT_BE_EMPTY('answer')]
        }
      }
    ]
  },
  { timestamps: true, versionKey: false }
)

module.exports = model(ASSESSMENT, assessmentSchema)
