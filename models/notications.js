const { Schema, model } = require('mongoose')
const {
  enums: { ROLE_ENUM, NOTIFICATION_TYPE }
} = require('~/consts/validation')
const { ENUM_CAN_BE_ONE_OF } = require('~/consts/errors')

const { USER, NOTIFICATIONS, REVIEW, COMMENT } = require('~/consts/models')

const notificationsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: true
    },
    userRole: {
      type: String,
      enum: {
        values: ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('user role', ROLE_ENUM)
      },
      required: [true, 'User role must be selected.']
    },
    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPE,
        message: ENUM_CAN_BE_ONE_OF('notification type', NOTIFICATION_TYPE)
      },
      select: false
    },
    reference: {
      type: Schema.Types.ObjectId,
      refPath: 'referenceModel',
      required: true
    },
    referenceModel: {
      type: String,
      required: true,
      enum: [REVIEW, COMMENT]
    }
  },
  { timestamps: true, versionKey: false }
)

module.exports = model(NOTIFICATIONS, notificationsSchema)
