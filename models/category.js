const { Schema, model } = require('mongoose')
const { FIELD_CAN_NOT_BE_EMPTY } = require('~/consts/errors')
const { OFFER, CATEGORY } = require('~/consts/models')

const categorySchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, FIELD_CAN_NOT_BE_EMPTY('name')]
    },
    categoryIcon: {
      path: {
        type: String,
        required: [true, FIELD_CAN_NOT_BE_EMPTY('category icon')]
      },
      color: {
        type: String,
        required: [true, FIELD_CAN_NOT_BE_EMPTY('icon color')]
      }
    },
    totalOffers: {
      type: Number,
      ref: OFFER,
      default: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

module.exports = model(CATEGORY, categorySchema)
