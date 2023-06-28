const { Schema, model } = require('mongoose')

const { FIELD_CANNOT_BE_EMPTY, FIELD_CANNOT_BE_SHORTER, FIELD_CANNOT_BE_LONGER } = require('~/consts/errors')
const { COURSE, USER, LESSON } = require('~/consts/models')

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('title')],
      minLength: [1, FIELD_CANNOT_BE_SHORTER('title', 1)],
      maxLength: [100, FIELD_CANNOT_BE_LONGER('title', 100)]
    },
    description: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('description')],
      minLength: [1, FIELD_CANNOT_BE_SHORTER('description', 1)],
      maxLength: [1000, FIELD_CANNOT_BE_LONGER('description', 1000)]
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('author')]
    },
    lessons: {
      type: [Schema.Types.ObjectId],
      ref: LESSON
    },
    attachments: {
      type: [String]
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

module.exports = model(COURSE, courseSchema)
