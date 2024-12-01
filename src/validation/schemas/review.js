const updateValidationSchema = {
  comment: {
    type: 'string',
    required: false
  },
  rating: {
    type: 'number',
    required: false
  }
}

module.exports = { updateValidationSchema }
