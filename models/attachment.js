const { ATTACHMENT, USER, CATEGORY } = require('~/consts/models')
const { Schema, model } = require('mongoose')
const { FIELD_CANNOT_BE_EMPTY, FIELD_CANNOT_BE_SHORTER, FIELD_CANNOT_BE_LONGER } = require('~/consts/errors')

const attachmentSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: true
    },
    fileName: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('file name')],
      minLength: [5, FIELD_CANNOT_BE_SHORTER('file name', 5)],
      maxLength: [100, FIELD_CANNOT_BE_LONGER('file name', 100)],
      trim: true
    },
    link: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('link')],
      trim: true
    },
    description: {
      type: String,
      minLength: [30, FIELD_CANNOT_BE_SHORTER('description', 30)],
      maxLength: [1000, FIELD_CANNOT_BE_LONGER('description', 1000)],
      trim: true
    },
    size: {
      type: Number,
      required: [true, FIELD_CANNOT_BE_EMPTY('size')]
    },
    category: {
      type: [Schema.Types.ObjectId],
      ref: CATEGORY
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

module.exports = model(ATTACHMENT, attachmentSchema)
