const { Schema, model } = require('mongoose')

const { USER, RESOURCES_CATEGORY } = require('~/consts/models')
const { FIELD_CANNOT_BE_EMPTY, FIELD_CANNOT_BE_LONGER, FIELD_CANNOT_BE_SHORTER } = require('~/consts/errors')

const resourcesCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('name')],
      minLength: [1, FIELD_CANNOT_BE_SHORTER('name', 1)],
      maxLength: [50, FIELD_CANNOT_BE_LONGER('name', 50)]
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('author')]
    }
  },
  { timestamps: true, versionKey: false }
)

module.exports = model(RESOURCES_CATEGORY, resourcesCategorySchema)
