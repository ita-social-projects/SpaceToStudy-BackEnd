const { Schema, model } = require('mongoose')
const {
  FIELD_CANNOT_BE_EMPTY,
  ENUM_CAN_BE_ONE_OF,
  FIELD_CANNOT_BE_LONGER,
  FIELD_CANNOT_BE_SHORTER
} = require('~/consts/errors')
const { USER, OFFER, COOPERATION } = require('~/consts/models')
const {
  enums: { COOPERATION_STATUS, PROFICIENCY_LEVEL_ENUM, AUTHOR_ROLE_ENUM }
} = require('~/consts/validation')

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
    initiatorRole: {
      type: String,
      enum: {
        values: AUTHOR_ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('initiator role', AUTHOR_ROLE_ENUM),
        required: [true, 'Initiator role must be selected.']
      }
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('recipient id')]
    },
    receiverRole: {
      type: String,
      enum: {
        values: AUTHOR_ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('receiver role', AUTHOR_ROLE_ENUM),
        required: [true, 'Receiver role must be selected.']
      }
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
