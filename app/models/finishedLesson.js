const { Schema, model } = require('mongoose')
const { LESSON, FINISHED_LESSON } = require('~/app/consts/models')

const finishedLessonSchema = new Schema(
  {
    lesson: {
      type: Schema.Types.ObjectId,
      ref: LESSON,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

module.exports = model(FINISHED_LESSON, finishedLessonSchema)
