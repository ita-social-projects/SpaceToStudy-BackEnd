const { Schema, model } = require('mongoose')
const { CHAT, USER, MESSAGE } = require('~/app/consts/models')
const {
  enums: { MAIN_ROLE_ENUM }
} = require('~/app/consts/validation')
const { ENUM_CAN_BE_ONE_OF, FIELD_MUST_BE_SELECTED } = require('~/app/consts/errors')

const chatSchema = new Schema(
  {
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: USER,
          required: true
        },
        role: {
          type: String,
          enum: {
            values: MAIN_ROLE_ENUM,
            message: ENUM_CAN_BE_ONE_OF('user role', MAIN_ROLE_ENUM)
          },
          required: [true, FIELD_MUST_BE_SELECTED('user role')]
        },
        _id: false
      }
    ],
    deletedFor: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: USER,
          required: true
        },
        _id: false
      }
    ],
    latestMessage: {
      type: Schema.Types.ObjectId,
      ref: MESSAGE
    }
  },
  { timestamps: true, versionKey: false }
)

module.exports = model(CHAT, chatSchema)
