const { Schema, model } = require('mongoose')
const {
  enums: { ROLE_ENUM, LANG_LEVEL_ENUM }
} = require('~/consts/validation')

const tutorSchema = new Schema(
  {
    role: {
      type: String,
      enum: ROLE_ENUM,
      required: true,
      default: 'tutor'
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: [true, 'Please enter an email'],
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      select: false
    },
    photo: {
      type: String
    },
    biography: {
      type: String
    },
    city: {
      type: String
    },
    education: {
      type: String
    },
    categories: {
      type: Schema.Types.ObjectId,
      ref: 'Category'
    },
    averageRating: {
      type: Number,
      min: 1,
      max: 5
    },
    ratingQuantity: {
      type: Number,
      default: 0
    },
    isEmailConfirmed: {
      type: Boolean,
      default: false
    },
    isFirstLogin: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: null
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
      select: false
    },
    blocked: {
      type: Boolean,
      required: true,
      default: false,
      select: false
    },
    languagesSpoken: [
      {
        language: String,
        level: {
          type: String,
          enum: LANG_LEVEL_ENUM
        }
      }
    ]
  },
  { timestamps: true }
)

module.exports = model('Tutor', tutorSchema)
