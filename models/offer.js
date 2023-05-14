const { Schema, model } = require('mongoose')
const Category = require('~/models/category')
const Subject = require('~/models/subject')
const {
  enums: { AUTHOR_ROLE_ENUM, SPOKEN_LANG_ENUM, PROFICIENCY_LEVEL_ENUM, OFFER_STATUS }
} = require('~/consts/validation')
const { USER, SUBJECT, CATEGORY, OFFER } = require('~/consts/models')
const { FIELD_CANNOT_BE_EMPTY, ENUM_CAN_BE_ONE_OF } = require('~/consts/errors')

const offerSchema = new Schema(
  {
    price: {
      type: Number,
      required: [true, FIELD_CANNOT_BE_EMPTY('price')],
      min: [1, 'Price must be a positive number']
    },
    proficiencyLevel: {
      type: [String],
      enum: {
        values: PROFICIENCY_LEVEL_ENUM,
        message: ENUM_CAN_BE_ONE_OF('proficiency level', PROFICIENCY_LEVEL_ENUM)
      },
      required: [true, FIELD_CANNOT_BE_EMPTY('proficiency level')]
    },
    description: {
      type: String,
      minLength: [1, 'Description cannot be shorter than 1 symbol.'],
      maxLength: [200, 'Description cannot be longer than 200 symbols.'],
      required: [true, FIELD_CANNOT_BE_EMPTY('description')]
    },
    languages: {
      type: [String],
      enum: {
        values: SPOKEN_LANG_ENUM,
        message: ENUM_CAN_BE_ONE_OF('language', SPOKEN_LANG_ENUM)
      },
      required: [true, 'Please select a language(s) that will be used in teaching.']
    },
    authorRole: {
      type: String,
      enum: {
        values: AUTHOR_ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('author role', AUTHOR_ROLE_ENUM),
        required: [true, 'Author role must be selected.']
      }
    },
    authorFirstName: {
      type: String,
      minLength: [1, 'Author first name cannot be shorter than 1 symbol.'],
      maxLength: [30, 'Author first name cannot be longer than 30 symbols.']
    },
    authorLastName: {
      type: String,
      minLength: [1, 'Author last name cannot be shorter than 1 symbol.'],
      maxLength: [30, 'Author last name cannot be longer than 30 symbols.']
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
        message: ENUM_CAN_BE_ONE_OF('offer status', OFFER_STATUS)
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

offerSchema.statics.calcTotalOffers = async function (category, subject) {
  const categoryTotalOffersQty = await this.countDocuments({ category })
  await Category.findByIdAndUpdate(category, { totalOffers: categoryTotalOffersQty }).exec()
  const subjectTotalOffersQty = await this.countDocuments({ subject })
  await Subject.findByIdAndUpdate(subject, { totalOffers: subjectTotalOffersQty }).exec()
}

offerSchema.post('save', async function (doc) {
  doc.constructor.calcTotalOffers(doc.category, doc.subject)
})

offerSchema.post('findOneAndRemove', async function (doc) {
  doc.constructor.calcTotalOffers(doc.category, doc.subject)
})

module.exports = model(OFFER, offerSchema)
