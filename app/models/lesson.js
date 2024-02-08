const { Schema, model } = require('mongoose')
const {
  FIELD_CANNOT_BE_EMPTY,
  FIELD_CANNOT_BE_SHORTER,
  FIELD_CANNOT_BE_LONGER,
  ENUM_CAN_BE_ONE_OF
} = require('~/app/consts/errors')
const { USER, LESSON, ATTACHMENT, RESOURCES_CATEGORY } = require('~/app/consts/models')
const {
  enums: { RESOURCES_TYPES_ENUM }
} = require('~/app/consts/validation')

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
      ref: RESOURCES_CATEGORY,
      default: null
    },
    resourceType: {
      type: String,
      enum: {
        values: RESOURCES_TYPES_ENUM,
        message: ENUM_CAN_BE_ONE_OF('resource type', RESOURCES_TYPES_ENUM)
      },
      default: RESOURCES_TYPES_ENUM[0]
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

module.exports = model(LESSON, lessonSchema)
