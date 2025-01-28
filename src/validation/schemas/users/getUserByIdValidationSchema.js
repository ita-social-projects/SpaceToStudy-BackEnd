const {
  enums: { MAIN_ROLE_ENUM }
} = require('~/consts/validation')

const getUserByIdValidationSchema = {
  role: {
    enum: MAIN_ROLE_ENUM,
    required: false
  },
  isEdit: {
    type: 'boolean',
    required: false
  }
}

module.exports = getUserByIdValidationSchema
