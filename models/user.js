const { Schema, model } = require('mongoose')
const {
  enums: { APP_LANG_ENUM, SPOKEN_LANG_ENUM, STATUS_ENUM }
} = require('~/consts/validation')
const {
  roles: { STUDENT, TUTOR, ADMIN, SUPERADMIN }
} = require('~/consts/auth')

const userSchema = new Schema(
  {
    role: {
      type: [String],
      enum: {
        values: [STUDENT, TUTOR, ADMIN, SUPERADMIN],
        message: `User role can be only ${STUDENT}, ${TUTOR}, ${ADMIN} or ${SUPERADMIN}`
      },
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
    nativeLanguage: {
      type: String,
      enum: {
        values: SPOKEN_LANG_ENUM,
        message: `Native language can be only one of these: ${SPOKEN_LANG_ENUM.toString()}`
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
        message: `App language can be only one of these: ${APP_LANG_ENUM.toString()}`
      },
      default: APP_LANG_ENUM[0],
      select: false
    },
    status: {
      type: String,
      enum: {
        values: STATUS_ENUM,
        message: `User status can be only one of these: ${STATUS_ENUM.toString()}`
      },
      default: STATUS_ENUM[0],
      select: false
    },
    lastLoginAs: {
      type: String,
      enum: {
        values: [STUDENT, TUTOR, ADMIN],
        message: `User's last login should be as ${STUDENT}, ${TUTOR} or ${ADMIN}`
      },
      select: false
    },
    bookmarkedOffers: { type: [Schema.Types.ObjectId], ref: 'Offer', select: false }
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

module.exports = model('User', userSchema)
