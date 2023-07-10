const { Schema, model } = require('mongoose')
const { FIELD_CANNOT_BE_EMPTY, FIELD_CANNOT_BE_SHORTER, FIELD_CANNOT_BE_LONGER } = require('~/consts/errors')
const { USER, LESSON } = require('~/consts/models')
const lessonSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: true
    },
    title: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('title')],
      minLength: [1, FIELD_CANNOT_BE_SHORTER('title', 1)],
      maxLength: [100, FIELD_CANNOT_BE_LONGER('title', 100)],
      trim: true
    },
    description: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('description')],
      minlength: [1, FIELD_CANNOT_BE_SHORTER('description', 1)],
      maxlength: [1000, FIELD_CANNOT_BE_LONGER('description', 1000)],
      trim: true
    },
    attachments: {
      type: [String]
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

module.exports = model(LESSON, lessonSchema)
