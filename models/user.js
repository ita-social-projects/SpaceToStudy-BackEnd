const { Schema, model } = require('mongoose')
const {
  enums: { APP_LANG_ENUM, SPOKEN_LANG_ENUM, STATUS_ENUM, ROLE_ENUM, LOGIN_ROLE_ENUM }
} = require('~/consts/validation')
const { SUBJECT, OFFER, USER } = require('~/consts/models')
const {
  FIELD_CANNOT_BE_EMPTY,
  ENUM_CAN_BE_ONE_OF,
  FIELD_CANNOT_BE_SHORTER,
  FIELD_CANNOT_BE_LONGER,
  FIELD_MUST_BE_SELECTED,
  VALUE_MUST_BE_ABOVE,
  VALUE_MUST_BE_BELOW
} = require('~/consts/errors')

const offerSchema = require('~/models/offer')

const userSchema = new Schema(
  {
    role: {
      type: [String],
      enum: {
        values: ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('user role', ROLE_ENUM)
      },
      required: [true, FIELD_MUST_BE_SELECTED('user role')]
    },
    firstName: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('first name')],
      minlength: [1, FIELD_CANNOT_BE_SHORTER('first name', 1)],
      maxlength: [30, FIELD_CANNOT_BE_LONGER('first name', 30)]
    },
    lastName: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('last name')],
      minlength: [1, FIELD_CANNOT_BE_SHORTER('last name', 1)],
      maxlength: [30, FIELD_CANNOT_BE_LONGER('last name', 30)]
    },
    email: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('email')],
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('password')],
      minlength: [8, FIELD_CANNOT_BE_SHORTER('password', 8)],
      select: false
    },
    address: {
      country: { type: String },
      city: { type: String }
    },
    photo: String,
    professionalSummary: String,
    mainSubjects: {
      student: {
        type: [Schema.Types.ObjectId],
        ref: SUBJECT
      },
      tutor: {
        type: [Schema.Types.ObjectId],
        ref: SUBJECT
      }
    },
    totalReviews: {
      student: { type: Number, default: 0 },
      tutor: { type: Number, default: 0 }
    },
    averageRating: {
      student: {
        type: Number,
        default: 0,
        min: [0, VALUE_MUST_BE_ABOVE('rating', 0)],
        max: [5, VALUE_MUST_BE_BELOW('rating', 5)],
        set: (val) => Math.round(val * 10) / 10
      },
      tutor: {
        type: Number,
        default: 0,
        min: [0, VALUE_MUST_BE_ABOVE('rating', 0)],
        max: [5, VALUE_MUST_BE_BELOW('rating', 5)],
        set: (val) => Math.round(val * 10) / 10
      }
    },
    nativeLanguage: {
      type: String,
      enum: {
        values: SPOKEN_LANG_ENUM,
        message: ENUM_CAN_BE_ONE_OF('native language', SPOKEN_LANG_ENUM)
      }
    },
    isEmailConfirmed: {
      type: Boolean,
      default: false,
      select: false
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
      select: false
    },
    lastLogin: {
      type: Date,
      default: null
    },
    appLanguage: {
      type: String,
      enum: {
        values: APP_LANG_ENUM,
        message: ENUM_CAN_BE_ONE_OF('app language', APP_LANG_ENUM)
      },
      default: APP_LANG_ENUM[0],
      select: false
    },
    status: {
      student: {
        type: String,
        enum: {
          values: STATUS_ENUM,
          message: ENUM_CAN_BE_ONE_OF('student status', STATUS_ENUM)
        },
        default: STATUS_ENUM[0]
      },
      tutor: {
        type: String,
        enum: {
          values: STATUS_ENUM,
          message: ENUM_CAN_BE_ONE_OF('tutor status', STATUS_ENUM)
        },
        default: STATUS_ENUM[0]
      },
      admin: {
        type: String,
        enum: {
          values: STATUS_ENUM,
          message: ENUM_CAN_BE_ONE_OF('admin status', STATUS_ENUM)
        },
        default: STATUS_ENUM[0]
      }
    },
    lastLoginAs: {
      type: String,
      enum: {
        values: LOGIN_ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('user status', LOGIN_ROLE_ENUM)
      },
      select: false
    },
    bookmarkedOffers: {
      type: [Schema.Types.ObjectId],
      ref: OFFER,
      select: false
    },
    FAQ: {
      type: {
        student: [
          {
            question: {
              type: String,
              required: [true, FIELD_CANNOT_BE_EMPTY('question')],
              validate: {
                validator: (question) => {
                  return question.trim().length > 0
                },
                message: 'Question cannot contain only whitespace'
              }
            },
            answer: {
              type: String,
              required: [true, FIELD_CANNOT_BE_EMPTY('answer')],
              validate: {
                validator: (answer) => {
                  return answer.trim().length > 0
                },
                message: 'Answer cannot contain only whitespace'
              }
            }
          }
        ],
        tutor: [
          {
            question: {
              type: String,
              required: [true, FIELD_CANNOT_BE_EMPTY('question')],
              validate: {
                validator: (question) => {
                  return question.trim().length > 0
                },
                message: 'Question cannot contain only whitespace'
              }
            },
            answer: {
              type: String,
              required: [true, FIELD_CANNOT_BE_EMPTY('answer')],
              validate: {
                validator: (answer) => {
                  return answer.trim().length > 0
                },
                message: 'Answer cannot contain only whitespace'
              }
            }
          }
        ]
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
    id: false
  }
)

userSchema.post('findOneAndRemove', async (doc) => {
  await offerSchema.deleteMany({ author: doc._id })
})

userSchema.post('findOneAndUpdate', async (doc) => {
  if (doc) {
    for (const [key, value] of Object.entries(doc.status)) {
      if (value === 'blocked') {
        await offerSchema.updateMany({ author: doc._id, authorRole: key }, { status: 'closed' })
      }
    }
  }
})

module.exports = model(USER, userSchema)
