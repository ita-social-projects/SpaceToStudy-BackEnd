const { ATTACHMENT, USER } = require('~/consts/models')
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
      maxLength: [55, FIELD_CANNOT_BE_LONGER('file name', 55)],
      trim: true
    },
    link: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('link')],
      trim: true
    },
    size: {
      type: Number,
      required: [true, FIELD_CANNOT_BE_EMPTY('size')]
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

module.exports = model(ATTACHMENT, attachmentSchema)
