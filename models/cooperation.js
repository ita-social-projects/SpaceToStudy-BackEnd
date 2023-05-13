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
      min: [30, 'Please provide at least 30 symbols'],
      max: [1000, "You can't provide more than 1000 symbols"]
      // required: true
    },
    requiredTutoringLevel: {
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
