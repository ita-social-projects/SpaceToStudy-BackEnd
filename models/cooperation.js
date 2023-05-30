const { Schema, model } = require('mongoose')
const {
  FIELD_CANNOT_BE_EMPTY,
  ENUM_CAN_BE_ONE_OF,
  FIELD_CANNOT_BE_LONGER,
  FIELD_CANNOT_BE_SHORTER
} = require('~/consts/errors')
const { USER, OFFER, COOPERATION, SUBJECT } = require('~/consts/models')
const {
  enums: { COOPERATION_STATUS, PROFICIENCY_LEVEL_ENUM }
} = require('~/consts/validation')
const User = require('./user')
const Subject = require('./subject')
const Offer = require('./offer')

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
    additionalInfo: {
      type: String,
      minLength: [30, FIELD_CANNOT_BE_SHORTER('additional info', 30)],
      maxLength: [1000, FIELD_CANNOT_BE_LONGER('additional info', 1000)]
    },
    proficiencyLevel: {
      type: String,
      enum: {
        values: PROFICIENCY_LEVEL_ENUM,
        message: ENUM_CAN_BE_ONE_OF('proficiency level', PROFICIENCY_LEVEL_ENUM)
      },
      required: true
    },
    price: {
      type: Number,
      required: [true, FIELD_CANNOT_BE_EMPTY('price')],
      min: [1, 'Price must be positive number']
    },
    subjectName: {
      type: String,
      ref: SUBJECT,
      required: false
    },
    initiatorFullName: {
      type: String,
      required: false
    },
    receiverFullName: {
      type: String,
      required: false
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
  const offer = await Offer.findById(this.offer).exec()
  const initiator = await User.findById(this.initiator).exec()
  const receiver = await User.findById(this.receiver).exec()
  const subject = await Subject.findById(offer.subject).exec()

  this.initiatorFullName = `${initiator.firstName} ${initiator.lastName}`
  this.receiverFullName = `${receiver.firstName} ${receiver.lastName}`
  this.subjectName = subject.name
  next()
})

module.exports = model(COOPERATION, cooperationSchema)
