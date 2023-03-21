const { Schema, model } = require('mongoose')
const {
  enums: { APP_LANG_ENUM, SPOKEN_LANG_ENUM, STATUS_ENUM }
} = require('~/consts/validation')
const {
  roles: { STUDENT, TUTOR, ADMIN, SUPERADMIN }
} = require('~/consts/auth')
const { refs: { CATEGORY, OFFER, USER } } = require('~/consts/models')

const userSchema = new Schema(
  {
    role: {
      type: [String],
      enum: [STUDENT, TUTOR, ADMIN, SUPERADMIN],
      required: [true, 'User role must be selected.']
    },
    firstName: {
      type: String,
      required: [true, 'This field cannot be empty.'],
      minlength: [1, 'First Name cannot be shorter than 1 symbol.'],
      maxlength: [30, 'First Name cannot be longer than 30 symbols.']
    },
    lastName: {
      type: String,
      required: [true, 'This field cannot be empty.'],
      minlength: [1, 'Last Name cannot be shorter than 1 symbol.'],
      maxlength: [30, 'Last Name cannot be longer than 30 symbols.']
    },
    email: {
      type: String,
      required: [true, 'This field cannot be empty.'],
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, 'This field cannot be empty.'],
      minlength: [8, 'Password cannot be shorter than 8 symbols.'],
      select: false
    },
    address: {
      country: { type: String },
      city: { type: String }
    },
    photo: String,
    education: String,
    categories: { type: [Schema.Types.ObjectId], ref: 'Category' },
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
      enum: SPOKEN_LANG_ENUM
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
      enum: APP_LANG_ENUM,
      default: APP_LANG_ENUM[0],
      select: false
    },
    status: {
      type: String,
      enum: STATUS_ENUM,
      default: STATUS_ENUM[0],
      select: false
    },
    lastLoginAs: {
      type: String,
      enum: [STUDENT, TUTOR, ADMIN],
      select: false
    },
    bookmarkedOffers: {
      type: [Schema.Types.ObjectId],
      ref: 'Offer',
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

// TODO:
// coops(virtuals)

module.exports = model(USER, userSchema)
