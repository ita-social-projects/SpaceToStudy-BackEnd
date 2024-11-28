const {
  enums: { MAIN_ROLE_ENUM, SPOKEN_LANG_ENUM, APP_LANG_ENUM },
  regex: { VIDEOLINK_PATTERN }
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

const updateUserValidationSchema = {
  firstName: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 30
  },
  lastName: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 30
  },
  professionalSummary: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 200
  },
  nativeLanguage: {
    enum: SPOKEN_LANG_ENUM,
    required: false
  },
  appLanguage: {
    enum: APP_LANG_ENUM,
    required: false
  },
  videoLink: {
    type: 'string',
    required: false,
    regex: VIDEOLINK_PATTERN
  }
}

module.exports = { getUserByIdValidationSchema, updateUserValidationSchema }
