const { Schema, model } = require('mongoose')
const { FIELD_CANNOT_BE_EMPTY, ENUM_CAN_BE_ONE_OF } = require('~/consts/errors')
const { USER, OFFER, COOPERATION, SUBJECT } = require('~/consts/models')
const {
  enums: { COOPERATION_STATUS, PROFICIENCY_LEVEL_ENUM, SPOKEN_LANG_ENUM }
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
      minLength: [30, 'Additional info cannot be shorter than 30 symbol.'],
      maxLength: [1000, 'Additional info cannot be longer than 1000 symbol.']
    },
    requiredProficiencyLevel: {
      type: String,
      enum: {
        values: PROFICIENCY_LEVEL_ENUM,
        message: ENUM_CAN_BE_ONE_OF('proficiency level', PROFICIENCY_LEVEL_ENUM)
      },
      required: true
    },
    requiredLanguage: {
      type: String,
      enum: {
        values: SPOKEN_LANG_ENUM,
        message: ENUM_CAN_BE_ONE_OF('language', SPOKEN_LANG_ENUM)
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
  const user = await User.findById(this.initiator).exec()
  const subject = await Subject.findById(offer.subject).exec()

  this.initiatorFullName = `${user.firstName} ${user.lastName}`
  this.subjectName = subject.name
  next()
})

module.exports = model(COOPERATION, cooperationSchema)
