const { Schema, model } = require('mongoose')
const {
  enums: { ROLE_ENUM, NOTIFICATION_TYPE_ENUM }
} = require('~/consts/validation')
const { ENUM_CAN_BE_ONE_OF, FIELD_MUST_BE_SELECTED } = require('~/consts/errors')
const { USER, NOTIFICATION, COOPERATION, MESSAGE, REVIEW, NOTE } = require('~/consts/models')

const notificationSchema = new Schema(
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
      required: [true, FIELD_MUST_BE_SELECTED('user role')]
    },
    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('type', NOTIFICATION_TYPE_ENUM)
      }
    },
    reference: {
      type: Schema.Types.ObjectId,
      refPath: 'referenceModel',
      required: true
    },
    referenceModel: {
      type: String,
      required: true,
      enum: [REVIEW, COOPERATION, MESSAGE, NOTE]
    }
  },
  { timestamps: true, versionKey: false }
)

module.exports = model(NOTIFICATION, notificationSchema)
