const { Schema, model } = require('mongoose')
const { FIELD_CANNOT_BE_EMPTY } = require('~/consts/errors')
const { COOPERATION, COMMENT, USER } = require('~/consts/models')

const commentSchema = new Schema(
  {
    text: {
      type:String,
      required:[true, FIELD_CANNOT_BE_EMPTY('text')]
    },
    author: {
      type:Schema.Types.ObjectId,
      ref:USER,
      required:[true, FIELD_CANNOT_BE_EMPTY('author')]
    },
    cooperation: {
      type:Schema.Types.ObjectId,
      ref:COOPERATION,
      required:[true, FIELD_CANNOT_BE_EMPTY('cooperation')]
    }
  },
  {
    timestamps: true,
    versionKey: false

  }
)

module.exports = model(COMMENT, commentSchema)
