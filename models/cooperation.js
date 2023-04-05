const { Schema, model } = require('mongoose')
const { FIELD_CANNOT_BE_EMPTY } = require('~/consts/errors')
const { USER, OFFER, COOPERATION } = require('~/consts/models')
const {
  enums: { COOPERATION_STATUS }
} = require('~/consts/validation')

const cooperationSchema = new Schema(
  {
    offerId: {
      type: Schema.Types.ObjectId,
      ref: OFFER,
      required: [true, FIELD_CANNOT_BE_EMPTY('offer id')]
    },
    initiatorUserId: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('initiator user id')]
    },
    recipientUserId: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('recipient user id')]
    },
    price: {
      type: Number,
      required: [true, FIELD_CANNOT_BE_EMPTY('price')],
      min: [1, 'Price must be positive number']
    },
    status: {
      type: String,
      enum: {
        values: COOPERATION_STATUS,
        message: `Cooperation status can be either of these: ${COOPERATION_STATUS.toString()}`
      },
      default: COOPERATION_STATUS[0]
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

module.exports = model(COOPERATION, cooperationSchema)
