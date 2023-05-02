const { Schema, model } = require('mongoose')
const {
  enums: { APP_LANG_ENUM, SPOKEN_LANG_ENUM, STATUS_ENUM, ROLE_ENUM, LOGIN_ROLE_ENUM }
} = require('~/consts/validation')
const { CATEGORY, OFFER, USER } = require('~/consts/models')
const { FIELD_CANNOT_BE_EMPTY } = require('~/consts/errors')
const offerSchema = require('~/models/offer')

const userSchema = new Schema(
  {
    role: {
      type: [String],
      enum: {
        values: ROLE_ENUM,
        message: `User role can be either of these: ${ROLE_ENUM.toString()}`
      },
      required: [true, 'User role must be selected.']
    },
    firstName: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('first name')],
      minlength: [1, 'First Name cannot be shorter than 1 symbol.'],
      maxlength: [30, 'First Name cannot be longer than 30 symbols.']
    },
    lastName: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('last name')],
      minlength: [1, 'Last Name cannot be shorter than 1 symbol.'],
      maxlength: [30, 'Last Name cannot be longer than 30 symbols.']
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
      minlength: [8, 'Password cannot be shorter than 8 symbols.'],
      select: false
    },
    address: {
      country: { type: String },
      city: { type: String }
    },
    photo: String,
    professionalSummary: String,
    categories: { type: [Schema.Types.ObjectId], ref: CATEGORY },
    totalReviews: {
      student: { type: Number, default: 0 },
      tutor: { type: Number, default: 0 }
    },
    averageRating: {
      student: {
        type: Number,
        default: 0,
        min: [0, 'Rating must be above 0'],
        max: [5, 'Rating must be below 5'],
        set: (val) => Math.round(val * 10) / 10
      },
      tutor: {
        type: Number,
        default: 0,
        min: [0, 'Rating must be above 0'],
        max: [5, 'Rating must be below 5'],
        set: (val) => Math.round(val * 10) / 10
      }
    },
    nativeLanguage: {
      type: String,
      enum: {
        values: SPOKEN_LANG_ENUM,
        message: `Native language can be either of these: ${SPOKEN_LANG_ENUM.toString()}`
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
        message: `App language can be either of these: ${APP_LANG_ENUM.toString()}`
      },
      default: APP_LANG_ENUM[0],
      select: false
    },
    status: {
      student: {
        type: String,
        enum: {
          values: STATUS_ENUM,
          message: `Student status can be either of these: ${STATUS_ENUM.toString()}`
        },
        default: STATUS_ENUM[0]
      },
      tutor: {
        type: String,
        enum: {
          values: STATUS_ENUM,
          message: `Tutor status can be either of these: ${STATUS_ENUM.toString()}`
        },
        default: STATUS_ENUM[0]
      },
      admin: {
        type: String,
        enum: {
          values: STATUS_ENUM,
          message: `Admin status can be either of these: ${STATUS_ENUM.toString()}`
        },
        default: STATUS_ENUM[0]
      }
    },
    lastLoginAs: {
      type: String,
      enum: {
        values: LOGIN_ROLE_ENUM,
        message: `User status can be either of these: ${LOGIN_ROLE_ENUM.toString()}`
      },
      select: false
    },
    bookmarkedOffers: {
      type: [Schema.Types.ObjectId],
      ref: OFFER,
      select: false
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
  for (const [key, value] of Object.entries(doc.status)) {
    if (value === 'blocked') {
      await offerSchema.updateMany({ author: doc._id, authorRole: key }, { status: 'closed' })
    }
  }
})

module.exports = model(USER, userSchema)
