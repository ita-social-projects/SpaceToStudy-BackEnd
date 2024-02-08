const { Schema, model } = require('mongoose')
const Category = require('~/app/models/category')
const Subject = require('~/app/models/subject')
const {
  enums: { MAIN_ROLE_ENUM, SPOKEN_LANG_ENUM, PROFICIENCY_LEVEL_ENUM, OFFER_STATUS_ENUM }
} = require('~/app/consts/validation')
const { USER, SUBJECT, CATEGORY, OFFER } = require('~/app/consts/models')
const {
  FIELD_CANNOT_BE_EMPTY,
  ENUM_CAN_BE_ONE_OF,
  FIELD_CANNOT_BE_LONGER,
  FIELD_CANNOT_BE_SHORTER,
  FIELD_MUST_BE_SELECTED,
  VALUE_MUST_BE_ABOVE
} = require('~/app/consts/errors')

const offerSchema = new Schema(
  {
    price: {
      type: Number,
      required: [true, FIELD_CANNOT_BE_EMPTY('price')],
      min: [1, VALUE_MUST_BE_ABOVE('price', 1)]
    },
    proficiencyLevel: {
      type: [String],
      enum: {
        values: PROFICIENCY_LEVEL_ENUM,
        message: ENUM_CAN_BE_ONE_OF('proficiency level', PROFICIENCY_LEVEL_ENUM)
      },
      required: [true, FIELD_CANNOT_BE_EMPTY('proficiency level')]
    },
    title: {
      type: String,
      minLength: [1, FIELD_CANNOT_BE_SHORTER('title', 1)],
      maxLength: [100, FIELD_CANNOT_BE_LONGER('title', 100)],
      required: [true, FIELD_CANNOT_BE_EMPTY('title')]
    },
    description: {
      type: String,
      minLength: [1, FIELD_CANNOT_BE_SHORTER('description', 1)],
      maxLength: [1000, FIELD_CANNOT_BE_LONGER('description', 1000)],
      required: [true, FIELD_CANNOT_BE_EMPTY('description')]
    },
    languages: {
      type: [String],
      enum: {
        values: SPOKEN_LANG_ENUM,
        message: ENUM_CAN_BE_ONE_OF('language', SPOKEN_LANG_ENUM)
      },
      required: [true, FIELD_MUST_BE_SELECTED('language(s)')]
    },
    authorRole: {
      type: String,
      enum: {
        values: MAIN_ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('author role', MAIN_ROLE_ENUM),
        required: [true, FIELD_MUST_BE_SELECTED('author role')]
      }
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: true
    },
    enrolledUsers: {
      type: [Schema.Types.ObjectId],
      ref: USER
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
        values: OFFER_STATUS_ENUM,
        message: ENUM_CAN_BE_ONE_OF('offer status', OFFER_STATUS_ENUM)
      },
      default: OFFER_STATUS_ENUM[0]
    },
    FAQ: {
      type: [
        {
          question: {
            type: String,
            required: [true, FIELD_CANNOT_BE_EMPTY('question')],
            validate: {
              validator: (question) => {
                return question.trim().length > 0
              },
              message: 'Question cannot contain only whitespace'
            }
          },
          answer: {
            type: String,
            required: [true, FIELD_CANNOT_BE_EMPTY('answer')],
            validate: {
              validator: (answer) => {
                return answer.trim().length > 0
              },
              message: 'Answer cannot contain only whitespace'
            }
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
  const categoryTotalOffersQty = await this.countDocuments({ category, authorRole, status: OFFER_STATUS_ENUM[0] })
  await Category.findByIdAndUpdate(category, { $set: { [`totalOffers.${authorRole}`]: categoryTotalOffersQty } }).exec()
  const subjectTotalOffersQty = await this.countDocuments({ subject, authorRole, status: OFFER_STATUS_ENUM[0] })
  await Subject.findByIdAndUpdate(subject, { $set: { [`totalOffers.${authorRole}`]: subjectTotalOffersQty } }).exec()
}

offerSchema.post('save', async function (doc) {
  doc.constructor.calcTotalOffers(doc.category, doc.subject, doc.authorRole)
})

offerSchema.post('findOneAndRemove', async function (doc) {
  doc.constructor.calcTotalOffers(doc.category, doc.subject, doc.authorRole)
})

module.exports = model(OFFER, offerSchema)
