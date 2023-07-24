const { Schema, model } = require('mongoose')
const { FIELD_CANNOT_BE_EMPTY } = require('~/consts/errors')
const { ATTACHMENT } = require('~/consts/models')

const attachmentSchema = new Schema(
  {
    fileName: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('fileName')]
    },
    link: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('link')]
    },
    description: {
      type: String,
      required: false
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
