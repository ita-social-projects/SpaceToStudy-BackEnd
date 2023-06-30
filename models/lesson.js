const { Schema, model } = require('mongoose')
const { FIELD_CANNOT_BE_EMPTY, FIELD_CANNOT_BE_SHORTER, FIELD_CANNOT_BE_LONGER } = require('~/consts/errors')
const { LESSON } = require('~/consts/models')
const lessonSchema = new Schema(
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
      minlength: [1, FIELD_CANNOT_BE_SHORTER('description', 1)],
      maxlength: [1000, FIELD_CANNOT_BE_LONGER('description', 1000)]
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
