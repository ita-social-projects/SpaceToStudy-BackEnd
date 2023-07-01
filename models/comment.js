const { Schema, model } = require('mongoose')
const { FIELD_CANNOT_BE_EMPTY, FIELD_CANNOT_BE_SHORTER, ENUM_CAN_BE_ONE_OF, FIELD_MUST_BE_SELECTED } = require('~/consts/errors')
const { COOPERATION, COMMENT, USER } = require('~/consts/models')
const {
  enums: { MAIN_ROLE_ENUM }
} = require('~/consts/validation')


const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('text')],
      minLength: [4, FIELD_CANNOT_BE_SHORTER('text', 4)]
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('author')]
    },
    authorRole: {
      type: String,
      enum: {
        values: MAIN_ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('author role', MAIN_ROLE_ENUM)
      },
      required: [true, 'Author role must be selected.']
    },
    cooperation: {
      type: Schema.Types.ObjectId,
      ref: COOPERATION,
      required: [true, FIELD_CANNOT_BE_EMPTY('cooperation')]
    },
  },
  {
    timestamps: true,
    versionKey: false
  }
)

module.exports = model(COMMENT, commentSchema)
