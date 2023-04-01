const { Schema, model } = require('mongoose')
const {
  enums: { AUTHOR_ROLE_ENUM, SPOKEN_LANG_ENUM, SUBJECT_LEVEL_ENUM }
} = require('~/consts/validation')
const { USER, SUBJECT, CATEGORY, OFFER } = require('~/consts/models')
const Category = require('./category')

const offerSchema = new Schema(
  {
    price: {
      type: Number,
      required: [true, 'This field cannot be empty.'],
      min: [1, 'Price must be positive number']
    },
    proficiencyLevel: {
      type: String,
      enum: {
        values: SUBJECT_LEVEL_ENUM,
        message: `Proficiency level can be either of these: ${SUBJECT_LEVEL_ENUM.toString()}`
      },
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
      enum: {
        values: SPOKEN_LANG_ENUM,
        message: `Language can be either of these: ${SPOKEN_LANG_ENUM.toString()}`
      },
      required: [true, 'Please select a language(s) that will be used in teaching.']
    },
    authorRole: {
      type: String,
      enum: {
        values: AUTHOR_ROLE_ENUM,
        message: `Author role can be either of these: ${AUTHOR_ROLE_ENUM.toString()}`
      },
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

offerSchema.post(/^create/, async function () {
  await Category.findByIdAndUpdate(this.categoryId, { $inc: { totalOffers: 1 } })
})

offerSchema.post(/^findByIdAndRemove/, async function () {
  await Category.findByIdAndUpdate(this.categoryId, { $inc: { totalOffers: -1 } })
})

module.exports = model(OFFER, offerSchema)
