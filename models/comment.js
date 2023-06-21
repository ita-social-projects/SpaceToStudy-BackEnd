const { Schema, model } = require('mongoose')
const { FIELD_CANNOT_BE_EMPTY, FIELD_CANNOT_BE_SHORTER } = require('~/consts/errors')
const { COOPERATION, COMMENT, USER } = require('~/consts/models')

const commentSchema = new Schema(
  {
    text: {
      type:String,
      required:[true, FIELD_CANNOT_BE_EMPTY('text')],
      minLength: [5, FIELD_CANNOT_BE_SHORTER('additional info', 5)],
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
