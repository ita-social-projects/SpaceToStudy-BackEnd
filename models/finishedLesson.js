const { Schema, model } = require('mongoose')
const { LESSON, FINISHED_LESSON } = require('~/consts/models')
const { FIELD_CANNOT_BE_EMPTY, ENUM_CAN_BE_ONE_OF } = require('~/consts/errors')
const {
  enums: { LESSON_STATUS_ENUM }
} = require('~/consts/validation')

const finishedLessonSchema = new Schema(
  {
    lesson: {
      type: Schema.Types.ObjectId,
      ref: LESSON,
      required: [true, FIELD_CANNOT_BE_EMPTY('lesson')]
    },
    status: {
      type: String,
      enum: {
        values: LESSON_STATUS_ENUM,
        message: ENUM_CAN_BE_ONE_OF('lesson status', LESSON_STATUS_ENUM)
      },
      default: LESSON_STATUS_ENUM[0]
    }
  },

  {
    timestamps: true,
    versionKey: false
  }
)

module.exports = model(FINISHED_LESSON, finishedLessonSchema)
