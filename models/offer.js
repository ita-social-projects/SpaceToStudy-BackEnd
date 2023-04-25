const { Schema, model } = require('mongoose')
const Category = require('~/models/category')
const Subject = require('~/models/subject')
const {
  enums: { AUTHOR_ROLE_ENUM, SPOKEN_LANG_ENUM, PROFICIENCY_LEVEL_ENUM, OFFER_STATUS }
} = require('~/consts/validation')
const { USER, SUBJECT, CATEGORY, OFFER } = require('~/consts/models')
const { FIELD_CANNOT_BE_EMPTY } = require('~/consts/errors')

const offerSchema = new Schema(
  {
    price: {
      type: Number,
      required: [true, FIELD_CANNOT_BE_EMPTY('price')],
      min: [1, 'Price must be positive number']
    },
    proficiencyLevel: {
      type: [String],
      enum: {
        values: PROFICIENCY_LEVEL_ENUM,
        message: `Proficiency level can be either of these: ${PROFICIENCY_LEVEL_ENUM.toString()}`
      },
      required: [true, FIELD_CANNOT_BE_EMPTY('proficiency level')]
    },
    description: {
      type: String,
      minlength: [1, 'Description cannot be shorter than 1 symbol.'],
      maxlength: [200, 'Description cannot be longer than 300 symbols.'],
      required: [true, FIELD_CANNOT_BE_EMPTY('description')]
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
    authorFirstName: {
      type: String,
      minlength: [1, 'Author first name cannot be shorter than 1 symbol.'],
      maxlength: [30, 'Author first name cannot be longer than 30 symbols.']
    },
    authorLastName: {
      type: String,
      minlength: [1, 'Author last name cannot be shorter than 1 symbol.'],
      maxlength: [30, 'Author last name cannot be longer than 30 symbols.']
    },
    authorAvgRating: {
      type: Number,
      min: [0, 'Rating must be a positive number'],
      max: [5, 'Rating must be below 5']
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: true
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: SUBJECT,
      required: true
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: CATEGORY,
      required: true
    },
    status: {
      type: String,
      enum: {
        values: OFFER_STATUS,
        message: `Offer status can be either of these: ${OFFER_STATUS.toString()}`
      },
      default: 'pending'
    }
  },
  {
    timestamps: true,
    versionKey: false,
    id: false
  }
)

offerSchema.statics.calcTotalOffers = async function (categoryId, subjectId) {
  const categoryTotalOffersQty = await this.countDocuments({ categoryId })
  await Category.findByIdAndUpdate(categoryId, { totalOffers: categoryTotalOffersQty }).exec()
  const subjectTotalOffersQty = await this.countDocuments({ subjectId })
  await Subject.findByIdAndUpdate(subjectId, { totalOffers: subjectTotalOffersQty }).exec()
}

offerSchema.post('save', async function (doc) {
  doc.constructor.calcTotalOffers(doc.categoryId, doc.subjectId)
})

offerSchema.post('findOneAndRemove', async function (doc) {
  doc.constructor.calcTotalOffers(doc.categoryId, doc.subjectId)
})

module.exports = model(OFFER, offerSchema)
