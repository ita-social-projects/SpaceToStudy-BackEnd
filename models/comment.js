const { Schema, model } = require('mongoose')
const { ENUM_CAN_BE_ONE_OF } = require('~/consts/errors')
const { COOPERATION, COMMENT, USER } = require('~/consts/models')
const {
  enums: { MAIN_ROLE_ENUM }
} = require('~/consts/validation')

const commentSchema = new Schema(
  {
    text: {
      type: String
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: USER
    },
    authorRole: {
      type: String,
      enum: {
        values: MAIN_ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('author role', MAIN_ROLE_ENUM)
      }
    },
    cooperation: {
      type: Schema.Types.ObjectId,
      ref: COOPERATION
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

module.exports = model(COMMENT, commentSchema)
