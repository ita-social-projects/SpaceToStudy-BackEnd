const { Schema, model } = require('mongoose')
const { FIELD_CANNOT_BE_EMPTY, FIELD_CANNOT_BE_SHORTER, FIELD_CANNOT_BE_LONGER } = require('~/consts/errors')
const { ATTACHMENT } = require('~/consts/models')

const attachmentSchema = new Schema(
  {
    fileName: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('fileName')],
      minLength: [5, FIELD_CANNOT_BE_SHORTER('file name', 5)],
      maxLength: [100, FIELD_CANNOT_BE_LONGER('file name', 100)]
    },
    link: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('link')]
    },
    description: {
      type: String,
      minLength: [30, FIELD_CANNOT_BE_SHORTER('description', 30)],
      maxLength: [1000, FIELD_CANNOT_BE_LONGER('description', 1000)]
    },
    contentType: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('contentType')]
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
