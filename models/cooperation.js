const { Schema, model } = require('mongoose')
const { FIELD_CANNOT_BE_EMPTY, ENUM_CAN_BE_ONE_OF } = require('~/consts/errors')
const { USER, OFFER, COOPERATION } = require('~/consts/models')
const {
  enums: { COOPERATION_STATUS, PROFICIENCY_LEVEL_ENUM, SPOKEN_LANG_ENUM }
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
    additionalInfo: {
      type: String,
      required: false
    },
    requiredTutoringLevel: {
      type: String,
      enum: {
        values: PROFICIENCY_LEVEL_ENUM,
        message: ENUM_CAN_BE_ONE_OF('required tutoring level', PROFICIENCY_LEVEL_ENUM)
      }
    },
    requiredLanguage: {
      type: String,
      enum: {
        values: SPOKEN_LANG_ENUM,
        message: ENUM_CAN_BE_ONE_OF('required language', SPOKEN_LANG_ENUM)
      }
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
