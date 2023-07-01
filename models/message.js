const { Schema, model } = require('mongoose')
const {
  FIELD_CANNOT_BE_EMPTY,
  ENUM_CAN_BE_ONE_OF,
  FIELD_CANNOT_BE_LONGER,
  FIELD_CANNOT_BE_SHORTER,
  FIELD_MUST_BE_SELECTED
} = require('~/consts/errors')
const { USER, MESSAGE, CHAT } = require('~/consts/models')
const {
  enums: { MAIN_ROLE_ENUM }
} = require('~/consts/validation')

const messageSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('author')]
    },
    authorRole: {
      type: String,
      enum: {
        values: MAIN_ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('author role', MAIN_ROLE_ENUM),
        required: [true, FIELD_MUST_BE_SELECTED('author role')]
      }
    },
    text: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('text')],
      minLength: [1, FIELD_CANNOT_BE_SHORTER('text', 1)],
      maxLength: [1000, FIELD_CANNOT_BE_LONGER('text', 1000)]
    },
    isRead: {
      type: Boolean,
      default: false,
      select: false
    },
    isNotified: {
      type: Boolean,
      default: true,
      select: false
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: CHAT,
      required: [true, FIELD_CANNOT_BE_EMPTY('chat')]
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

module.exports = model(MESSAGE, messageSchema)
