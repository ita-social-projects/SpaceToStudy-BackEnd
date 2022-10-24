const { Schema, model } = require('mongoose')
const {
  enums: { LANG_ENUM }
} = require('~/consts/validation')

const tutorSchema = new Schema(
  {
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true
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
      required: [true, 'Please enter a password']
    },
    photo: {
      type: String
    },
    bio: {
      //??
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
    subjects: {
      //??
      type: Schema.Types.ObjectId,
      ref: 'Category'
    },
    averageRating: {
      type: Number,
      min: 1,
      max: 5
    },
    ratingQuantity: {
      type: Number
    },
    isEmailConfirmed: {
      type: Boolean,
      default: false
    },
    isFirstLogin: {
      type: Boolean,
      default: true
    },
    active: {
      type: Boolean,
      required: true,
      default: true
    },
    blocked: {
      type: Boolean,
      required: true,
      default: false
    },
    lastLogin: {
      type: Date,
      default: null
    },
    language: {
      //??
      type: String,
      enum: LANG_ENUM,
      default: LANG_ENUM[0]
    }
  },
  { timestamps: true }
)

module.exports = model('Tutor', tutorSchema)
