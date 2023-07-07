const { Schema, model } = require('mongoose')
const { CHAT, USER } = require('~/consts/models')
const {
  enums: { MAIN_ROLE_ENUM }
} = require('~/consts/validation')
const { ENUM_CAN_BE_ONE_OF, FIELD_MUST_BE_SELECTED } = require('~/consts/errors')

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
    ]
  },
  { timestamps: true, versionKey: false }
)

module.exports = model(CHAT, chatSchema)
