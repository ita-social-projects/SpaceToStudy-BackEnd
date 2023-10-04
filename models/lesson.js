const { Schema, model } = require('mongoose')
const { FIELD_CANNOT_BE_EMPTY, FIELD_CANNOT_BE_SHORTER, FIELD_CANNOT_BE_LONGER } = require('~/consts/errors')
const { USER, LESSON, ATTACHMENT, CATEGORY } = require('~/consts/models')
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
      minLength: [1, FIELD_CANNOT_BE_SHORTER('description', 1)],
      maxLength: [1000, FIELD_CANNOT_BE_LONGER('description', 1000)],
      trim: true
    },
    content: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('content')],
      minLength: [50, FIELD_CANNOT_BE_SHORTER('content', 50)],
      trim: true
    },
    attachments: {
      type: [Schema.Types.ObjectId],
      ref: ATTACHMENT
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: CATEGORY,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

module.exports = model(LESSON, lessonSchema)
