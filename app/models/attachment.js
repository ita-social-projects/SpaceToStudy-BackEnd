const { ATTACHMENT, USER, RESOURCES_CATEGORY } = require('~/app/consts/models')
const { Schema, model } = require('mongoose')
const {
  FIELD_CANNOT_BE_EMPTY,
  FIELD_CANNOT_BE_SHORTER,
  FIELD_CANNOT_BE_LONGER,
  ENUM_CAN_BE_ONE_OF
} = require('~/app/consts/errors')
const {
  enums: { RESOURCES_TYPES_ENUM }
} = require('~/app/consts/validation')

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
    description: {
      type: String,
      maxLength: [150, FIELD_CANNOT_BE_LONGER('description', 150)],
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
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: RESOURCES_CATEGORY,
      default: null
    },
    resourceType: {
      type: String,
      enum: {
        values: RESOURCES_TYPES_ENUM,
        message: ENUM_CAN_BE_ONE_OF('resource type', RESOURCES_TYPES_ENUM)
      },
      default: RESOURCES_TYPES_ENUM[1]
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

module.exports = model(ATTACHMENT, attachmentSchema)
