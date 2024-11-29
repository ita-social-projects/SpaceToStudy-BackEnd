const {
  lengths: { MAX_NAME_LENGTH, MIN_NAME_LENGTH, MIN_PROFFESSIONAL_SUMMARY_LENGTH, MAX_PROFFESSIONAL_SUMMARY_LENGTH },
  enums: { MAIN_ROLE_ENUM, SPOKEN_LANG_ENUM, APP_LANG_ENUM },
  regex: { VIDEOLINK_PATTERN, NAME_PATTERN }
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
    regex: NAME_PATTERN,
    required: false,
    length: {
      min: MIN_NAME_LENGTH,
      max: MAX_NAME_LENGTH
    }
  },
  lastName: {
    regex: NAME_PATTERN,
    required: false,
    length: {
      min: MIN_NAME_LENGTH,
      max: MAX_NAME_LENGTH
    }
  },
  professionalSummary: {
    type: 'string',
    required: false,
    length: {
      min: MIN_PROFFESSIONAL_SUMMARY_LENGTH,
      max: MAX_PROFFESSIONAL_SUMMARY_LENGTH
    }
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
