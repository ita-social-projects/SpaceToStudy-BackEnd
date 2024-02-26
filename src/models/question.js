const { Schema, model } = require('mongoose')
const {
  enums: { QUESTION_TYPE_ENUM, RESOURCES_TYPES_ENUM }
} = require('~/consts/validation')
const { QUESTION, USER, RESOURCES_CATEGORY } = require('~/consts/models')
const {
  FIELD_CANNOT_BE_EMPTY,
  FIELD_CANNOT_BE_LONGER,
  FIELD_CANNOT_BE_SHORTER,
  ENUM_CAN_BE_ONE_OF
} = require('~/consts/errors')

const questionSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('title')],
      minLength: [1, FIELD_CANNOT_BE_SHORTER('title', 1)],
      maxLength: [100, FIELD_CANNOT_BE_LONGER('title', 100)]
    },
    text: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('text')],
      minLength: [1, FIELD_CANNOT_BE_SHORTER('text', 1)],
      maxLength: [100, FIELD_CANNOT_BE_LONGER('text', 100)]
    },
    answers: [
      {
        _id: false,
        text: {
          type: String,
          required: [true, FIELD_CANNOT_BE_EMPTY('answer')],
          minLength: [1, FIELD_CANNOT_BE_SHORTER('answer', 1)],
          maxLength: [150, FIELD_CANNOT_BE_LONGER('answer', 150)]
        },
        isCorrect: {
          type: Boolean,
          default: false
        }
      }
    ],
    type: {
      type: String,
      enum: {
        values: QUESTION_TYPE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('type', QUESTION_TYPE_ENUM)
      },
      required: true
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: RESOURCES_CATEGORY,
      default: null
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('author')]
    },
    resourceType: {
      type: String,
      enum: {
        values: RESOURCES_TYPES_ENUM,
        message: ENUM_CAN_BE_ONE_OF('resource type', RESOURCES_TYPES_ENUM)
      },
      default: RESOURCES_TYPES_ENUM[2]
    }
  },
  { timestamps: true, versionKey: false }
)

module.exports = model(QUESTION, questionSchema)
