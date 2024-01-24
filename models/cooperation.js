const { Schema, model } = require('mongoose')
const {
  FIELD_CANNOT_BE_EMPTY,
  ENUM_CAN_BE_ONE_OF,
  FIELD_CANNOT_BE_LONGER,
  FIELD_CANNOT_BE_SHORTER,
  FIELD_MUST_BE_SELECTED,
  VALUE_MUST_BE_ABOVE
} = require('~/consts/errors')
const { USER, OFFER, COOPERATION, FINISHED_QUIZ, QUIZ, LESSON, ATTACHMENT } = require('~/consts/models')
const {
  enums: { COOPERATION_STATUS_ENUM, PROFICIENCY_LEVEL_ENUM, MAIN_ROLE_ENUM }
} = require('~/consts/validation')
const { REQUESTED, UPDATED } = require('~/consts/notificationTypes')
const notificationService = require('~/services/notification')

const cooperationSchema = new Schema(
  {
    offer: {
      type: Schema.Types.ObjectId,
      ref: OFFER,
      required: [true, FIELD_CANNOT_BE_EMPTY('offer')]
    },
    initiator: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('initiator')]
    },
    initiatorRole: {
      type: String,
      enum: {
        values: MAIN_ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('initiator role', MAIN_ROLE_ENUM),
        required: [true, FIELD_MUST_BE_SELECTED('initiator role')]
      }
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('receiver')]
    },
    receiverRole: {
      type: String,
      enum: {
        values: MAIN_ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('receiver role', MAIN_ROLE_ENUM),
        required: [true, FIELD_MUST_BE_SELECTED('receiver role')]
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
      min: [1, VALUE_MUST_BE_ABOVE('price', 1)]
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
      },
      required: true
    },
    availableQuizzes: {
      type: [Schema.Types.ObjectId],
      ref: QUIZ
    },
    finishedQuizzes: {
      type: [Schema.Types.ObjectId],
      ref: FINISHED_QUIZ
    },
    sections: [
      {
        title: {
          type: String,
          required: [true, FIELD_CANNOT_BE_EMPTY('section title')],
          minLength: [1, FIELD_CANNOT_BE_SHORTER('section title', 1)],
          maxLength: [100, FIELD_CANNOT_BE_LONGER('section title', 100)]
        },
        description: {
          type: String,
          required: [true, FIELD_CANNOT_BE_EMPTY('section description')],
          minLength: [1, FIELD_CANNOT_BE_SHORTER('section description', 1)],
          maxLength: [1000, FIELD_CANNOT_BE_LONGER('section description', 1000)]
        },
        activities: [
          {
            _id: false,
            resource: {
              type: Schema.Types.Mixed,
              required: [true, FIELD_CANNOT_BE_EMPTY('activity resource')]
            },
            resourceType: {
              type: String,
              required: [true, FIELD_MUST_BE_SELECTED('activity resource type')],
              enum: {
                values: [LESSON, QUIZ, ATTACHMENT],
                message: ENUM_CAN_BE_ONE_OF('activity resource type', [LESSON, QUIZ, ATTACHMENT])
              }
            }
          }
        ]
      }
    ]
  },
  {
    timestamps: true,
    versionKey: false
  }
)

cooperationSchema.post('save', async function () {
  const notificationData = {
    user: this.receiver,
    userRole: this.receiverRole,
    type: REQUESTED,
    reference: this._id,
    referenceModel: COOPERATION
  }

  await notificationService.createNotification(notificationData)
})

cooperationSchema.pre('findOneAndUpdate', function (next) {
  if (this._update.price) {
    this.type = UPDATED

    next()
  }

  if (this._update.status) {
    this.type = this._update.status

    next()
  }
})

cooperationSchema.post('findOneAndUpdate', async function (doc) {
  let user
  if (this.type === UPDATED) {
    user = doc.needAction === doc.initiatorRole ? doc.receiver : doc.initiator
  } else {
    user = doc.needAction === doc.initiatorRole ? doc.initiator : doc.receiver
  }

  const notificationData = {
    user,
    userRole: user === doc.initiator ? doc.initiatorRole : doc.receiverRole,
    type: this.type,
    reference: doc._id,
    referenceModel: COOPERATION
  }

  await notificationService.createNotification(notificationData)
})

module.exports = model(COOPERATION, cooperationSchema)
