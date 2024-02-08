const { Schema, model } = require('mongoose')
const { FIELD_CANNOT_BE_EMPTY } = require('~/app/consts/errors')
const { OFFER, CATEGORY } = require('~/app/consts/models')

const categorySchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, FIELD_CANNOT_BE_EMPTY('name')]
    },
    appearance: {
      icon: {
        type: String,
        required: [true, FIELD_CANNOT_BE_EMPTY('category icon')],
        default: 'mocked-path-to-icon'
      },
      color: {
        type: String,
        required: [true, FIELD_CANNOT_BE_EMPTY('icon color')],
        default: '#66C42C'
      }
    },
    totalOffers: {
      student: {
        type: Number,
        ref: OFFER,
        default: 0
      },
      tutor: {
        type: Number,
        ref: OFFER,
        default: 0
      }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

module.exports = model(CATEGORY, categorySchema)
