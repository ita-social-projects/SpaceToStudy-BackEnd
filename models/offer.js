const { Schema, model } = require('mongoose')
const Category = require('~/models/category')
const Subject = require('~/models/subject')
const {
  enums: { MAIN_ROLE_ENUM, SPOKEN_LANG_ENUM, PROFICIENCY_LEVEL_ENUM, OFFER_STATUS_ENUM }
} = require('~/consts/validation')
const { USER, SUBJECT, CATEGORY, OFFER } = require('~/consts/models')
const { ENUM_CAN_BE_ONE_OF } = require('~/consts/errors')

const offerSchema = new Schema(
  {
    price: {
      type: Number
    },
    proficiencyLevel: {
      type: [String],
      enum: {
        values: PROFICIENCY_LEVEL_ENUM,
        message: ENUM_CAN_BE_ONE_OF('proficiency level', PROFICIENCY_LEVEL_ENUM)
      }
    },
    title: {
      type: String
    },
    description: {
      type: String
    },
    languages: {
      type: [String],
      enum: {
        values: SPOKEN_LANG_ENUM,
        message: ENUM_CAN_BE_ONE_OF('language', SPOKEN_LANG_ENUM)
      }
    },
    authorRole: {
      type: String,
      enum: {
        values: MAIN_ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('author role', MAIN_ROLE_ENUM)
      }
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: USER
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: SUBJECT
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: CATEGORY
    },
    status: {
      type: String,
      enum: {
        values: OFFER_STATUS_ENUM,
        message: ENUM_CAN_BE_ONE_OF('offer status', OFFER_STATUS_ENUM)
      },
      default: OFFER_STATUS_ENUM[0]
    },
    FAQ: {
      type: [
        {
          question: {
            type: String
          },
          answer: {
            type: String
          }
        }
      ]
    }
  },
  {
    timestamps: true,
    versionKey: false,
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

offerSchema.statics.calcTotalOffers = async function (category, subject, authorRole) {
  const categoryTotalOffersQty = await this.countDocuments({ category, authorRole })
  await Category.findByIdAndUpdate(category, { $set: { [`totalOffers.${authorRole}`]: categoryTotalOffersQty } }).exec()
  const subjectTotalOffersQty = await this.countDocuments({ subject, authorRole })
  await Subject.findByIdAndUpdate(subject, { $set: { [`totalOffers.${authorRole}`]: subjectTotalOffersQty } }).exec()
}

offerSchema.post('save', async function (doc) {
  doc.constructor.calcTotalOffers(doc.category, doc.subject, doc.authorRole)
})

offerSchema.post('findOneAndRemove', async function (doc) {
  doc.constructor.calcTotalOffers(doc.category, doc.subject, doc.authorRole)
})

module.exports = model(OFFER, offerSchema)
