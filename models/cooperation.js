const { Schema, model } = require('mongoose')
const { FIELD_CANNOT_BE_EMPTY, DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const { USER, OFFER, COOPERATION, SUBJECT } = require('~/consts/models')
const {
  enums: { COOPERATION_STATUS }
} = require('~/consts/validation')
const User = require('./user')
const { createNotFoundError } = require('~/utils/errorsHelper')

const cooperationSchema = new Schema(
  {
    offer: {
      type: Schema.Types.ObjectId,
      ref: OFFER,
      required: [true, FIELD_CANNOT_BE_EMPTY('offer id')]
    },
    initiator: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('initiator id')]
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('recipient id')]
    },
    price: {
      type: Number,
      required: [true, FIELD_CANNOT_BE_EMPTY('price')],
      min: [1, 'Price must be positive number']
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: SUBJECT,
      required: [true, FIELD_CANNOT_BE_EMPTY('subject id')]
    },
    authorFirstName: {
      type: String,
      required: [false, FIELD_CANNOT_BE_EMPTY('author first name')]
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

cooperationSchema.pre('save', async function (next) {
  const user = await User.findById(this.initiator)

  if (user) {
    this.authorFirstName = user.firstName
    next()
  } else throw createNotFoundError(DOCUMENT_NOT_FOUND(User.modelName))
})

module.exports = model(COOPERATION, cooperationSchema)
