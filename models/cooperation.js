const { Schema, model } = require('mongoose')
const {
  enums: { COOPERATION_STATUS }
} = require('~/consts/validation')

const cooperationSchema = new Schema(
  {
    offerId: {
      type: Schema.Types.ObjectId,
      ref: 'Offer',
      required: true
    },
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    price: {
      type: Number,
      required: [true, 'This field cannot be empty.'],
      min: [1, 'Price must be positive number']
    },
    status: {
      type: String,
      enum: COOPERATION_STATUS,
      required: [true, 'Cooperation status must be selected.']
    }
  },
  { timestamps: true, versionKey: false }
)

module.exports = model('Cooperation', cooperationSchema)
