const { Schema, model } = require('mongoose')
const {
  enums: { COOPERATION_STATUS }
} = require('~/consts/validation')

const cooperationSchema = new Schema(
  {
    offerId: {
      type: Schema.Types.ObjectId,
      ref: 'Offer',
      required: [true, 'Offer ID must be valid.']
    },
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tutor ID must be valid.']
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID must be valid.']
    },
    price: {
      type: Number,
      required: [true, 'This field cannot be empty.'],
      min: [1, 'Price must be positive number']
    },
    status: {
      type: String,
      enum: {
        values: COOPERATION_STATUS,
        message: `Cooperation status can be either of these: ${COOPERATION_STATUS.toString()}`
      },
      default: COOPERATION_STATUS[0]
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

module.exports = model('Cooperation', cooperationSchema)
