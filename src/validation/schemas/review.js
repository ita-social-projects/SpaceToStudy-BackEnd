const {
  enums: { MAIN_ROLE_ENUM }
} = require('~/consts/validation')

const addReviewValidationSchema = {
  rating: {
    type: 'number',
    required: true,
    range: {
      min: 1,
      max: 5
    }
  },
  targetUserId: {
    type: 'string',
    required: true
  },
  targetUserRole: {
    enum: MAIN_ROLE_ENUM,
    required: true
  },
  offer: {
    type: 'string',
    required: true
  },
  comment: {
    type: 'string',
    required: false
  }
}

const updateReviewValidationSchema = {
  comment: {
    type: 'string',
    required: false
  },
  rating: {
    type: 'number',
    required: false,
    range: {
      min: 1,
      max: 5
    }
  }
}

module.exports = { addReviewValidationSchema, updateReviewValidationSchema }
