const { Schema, model } = require('mongoose')
const { QUIZ, USER, RESOURCES_CATEGORY, QUESTION } = require('~/app/consts/models')
const {
  FIELD_CANNOT_BE_EMPTY,
  FIELD_CANNOT_BE_LONGER,
  FIELD_CANNOT_BE_SHORTER,
  ENUM_CAN_BE_ONE_OF
} = require('~/app/consts/errors')
const {
  enums: { QUIZ_VIEW_ENUM, RESOURCES_TYPES_ENUM }
} = require('~/app/consts/validation')

const quizSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('title')],
      minLength: [1, FIELD_CANNOT_BE_SHORTER('title', 1)],
      maxLength: [100, FIELD_CANNOT_BE_LONGER('title', 100)]
    },
    description: {
      type: String,
      maxLength: [150, FIELD_CANNOT_BE_LONGER('description', 150)],
      trim: true
    },
    items: {
      type: [Schema.Types.ObjectId],
      ref: QUESTION,
      required: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('author')]
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
      default: RESOURCES_TYPES_ENUM[3]
    },
    settings: {
      view: {
        type: String,
        enum: {
          values: QUIZ_VIEW_ENUM,
          message: ENUM_CAN_BE_ONE_OF('quiz view', QUIZ_VIEW_ENUM)
        },
        default: QUIZ_VIEW_ENUM[1]
      },
      shuffle: {
        type: Boolean,
        default: false
      },
      pointValues: {
        type: Boolean,
        default: false
      },
      scoredResponses: {
        type: Boolean,
        default: false
      },
      correctAnswers: {
        type: Boolean,
        default: false
      }
    }
  },
  { timestamps: true, versionKey: false }
)

module.exports = model(QUIZ, quizSchema)
