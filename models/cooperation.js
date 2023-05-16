const { Schema, model } = require('mongoose')
const { FIELD_CANNOT_BE_EMPTY, ENUM_CAN_BE_ONE_OF } = require('~/consts/errors')
const { USER, OFFER, COOPERATION } = require('~/consts/models')
const {
  enums: { COOPERATION_STATUS, PROFICIENCY_LEVEL_ENUM, SPOKEN_LANG_ENUM }
} = require('~/consts/validation')

const cooperationSchema = new Schema(
  {
    offer: {
      type: Schema.Types.ObjectId,
      ref: OFFER,
      required: [true, FIELD_CANNOT_BE_EMPTY('offer')]
    },
    initiatorUserId: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('initiator user id')]
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
        message: ENUM_CAN_BE_ONE_OF('tutoring level', PROFICIENCY_LEVEL_ENUM)
      },
      required: true
    },
    requiredLanguage: {
      type: String,
      enum: {
        values: SPOKEN_LANG_ENUM,
        message: ENUM_CAN_BE_ONE_OF('tutoring language', SPOKEN_LANG_ENUM)
      },
      required: true
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
        message: ENUM_CAN_BE_ONE_OF('cooperation status', COOPERATION_STATUS)
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
