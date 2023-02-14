const { Schema, model } = require('mongoose')
const {
  enums: { SPOKEN_LANG_ENUM, SUBJECT_LEVEL_ENUM }
} = require('~/consts/validation')
const {
  roles: { STUDENT, TUTOR }
} = require('~/consts/auth')

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
      minlength: [1, 'Last Name cannot be shorter than 1 symbol.'],
      maxlength: [200, 'Last Name cannot be longer than 300 symbols.'],
      required: [true, 'This field cannot be empty.']
    },
    languages: {
      type: [String],
      enum: SPOKEN_LANG_ENUM,
      required: [true, 'Spoken language must be selected.']
    },
    userRole: {
      type: String,
      enum: [STUDENT, TUTOR],
      required: [true, 'User role must be selected.']
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    isActive: {
      type: Boolean,
      default: false,
      select: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

module.exports = model('Offer', offerSchema)
