const {
  enums: { RESOURCE_COMPLETION_STATUS_ENUM }
} = require('~/consts/validation')

const updateResourceCompletionStatusValidationSchema = {
  completionStatus: {
    required: true,
    enum: RESOURCE_COMPLETION_STATUS_ENUM
  }
}

module.exports = { updateResourceCompletionStatusValidationSchema }
