const { USER, NOTE, COOPERATION } = require('~/consts/models')
const { Schema, model } = require('mongoose')
const { FIELD_CANNOT_BE_EMPTY, FIELD_CANNOT_BE_SHORTER, FIELD_CANNOT_BE_LONGER } = require('~/consts/errors')

const notesSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('text')],
      minLength: [0, FIELD_CANNOT_BE_SHORTER('text', 0)],
      maxLength: [100, FIELD_CANNOT_BE_LONGER('text', 100)],
      trim: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('author')]
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    cooperation: {
      type: Schema.Types.ObjectId,
      ref: COOPERATION,
      required: [true, FIELD_CANNOT_BE_EMPTY('cooperation')]
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

module.exports = model(NOTE, notesSchema)
