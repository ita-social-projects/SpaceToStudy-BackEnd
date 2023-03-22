const { Schema, model } = require('mongoose')
const {
  enums: { SPOKEN_LANG_ENUM, SUBJECT_LEVEL_ENUM }
} = require('~/consts/validation')
const {
  roles: { STUDENT, TUTOR }
} = require('~/consts/auth')
const { USER, SUBJECT, CATEGORY, OFFER } = require('~/consts/models')

const offerSchema = new Schema(
  {
    price: {
      type: Number,
      required: [true, 'This field cannot be empty.'],
      min: [1, 'Price must be positive number']
    },
    proficiencyLevel: {
      type: String,
      enum: SUBJECT_LEVEL_ENUM,
      required: [true, 'This field cannot be empty.']
    },
    description: {
      type: String,
      minlength: [1, 'Description cannot be shorter than 1 symbol.'],
      maxlength: [200, 'Description cannot be longer than 300 symbols.'],
      required: [true, 'This field cannot be empty.']
    },
    languages: {
      type: [String],
      enum: SPOKEN_LANG_ENUM,
      required: [true, 'Please select a language(s) that will be used in teaching.']
    },
    authorRole: {
      type: String,
      enum: { values: [STUDENT, TUTOR], message: `Author role can be either ${STUDENT} or ${TUTOR}` },
      required: [true, 'Author role must be selected.']
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: true
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: SUBJECT,
      required: true
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: CATEGORY,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false,
    id: false
  }
)

module.exports = model(OFFER, offerSchema)
