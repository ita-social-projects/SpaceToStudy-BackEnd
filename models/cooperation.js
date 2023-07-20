const { Schema, model } = require('mongoose')
const { ENUM_CAN_BE_ONE_OF } = require('~/consts/errors')
const { USER, OFFER, COOPERATION } = require('~/consts/models')
const {
  enums: { COOPERATION_STATUS_ENUM, PROFICIENCY_LEVEL_ENUM, MAIN_ROLE_ENUM }
} = require('~/consts/validation')

const cooperationSchema = new Schema(
  {
    offer: {
      type: Schema.Types.ObjectId,
      ref: OFFER
    },
    initiator: {
      type: Schema.Types.ObjectId,
      ref: USER
    },
    initiatorRole: {
      type: String,
      enum: {
        values: MAIN_ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('initiator role', MAIN_ROLE_ENUM)
      }
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: USER
    },
    receiverRole: {
      type: String,
      enum: {
        values: MAIN_ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('receiver role', MAIN_ROLE_ENUM)
      }
    },
    additionalInfo: {
      type: String
    },
    proficiencyLevel: {
      type: String,
      enum: {
        values: PROFICIENCY_LEVEL_ENUM,
        message: ENUM_CAN_BE_ONE_OF('proficiency level', PROFICIENCY_LEVEL_ENUM)
      }
    },
    price: {
      type: Number
    },
    status: {
      type: String,
      enum: {
        values: COOPERATION_STATUS_ENUM,
        message: ENUM_CAN_BE_ONE_OF('cooperation status', COOPERATION_STATUS_ENUM)
      },
      default: COOPERATION_STATUS_ENUM[0]
    },
    needAction: {
      type: String,
      enum: {
        values: MAIN_ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('need action', MAIN_ROLE_ENUM)
      }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

module.exports = model(COOPERATION, cooperationSchema)
