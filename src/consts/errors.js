const {
  enums: { APP_LANG_ENUM }
} = require('~/consts/validation')

const errors = {
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'User with the specified email was not found.'
  },
  NOT_USERS_ATTEMPTS: {
    code: 'FORBIDDEN',
    message: 'The user does not have the access to these attempts.'
  },
  INCORRECT_CREDENTIALS: {
    code: 'INCORRECT_CREDENTIALS',
    message: 'The password you entered is incorrect.'
  },
  BODY_IS_NOT_DEFINED: {
    code: 'BODY_IS_NOT_DEFINED',
    message: 'request body should not be null or undefined.'
  },
  QUIZ_TIME_LIMIT_EXCEEDED: {
    code: 'QUIZ_TIME_LIMIT_EXCEEDED',
    message: 'The time limit for the quiz has been exceeded.'
  },
  FIELD_CAN_BE_ONE_OF: (field, enums) => ({
    code: 'FIELD_IS_NOT_OF_PROPER_TYPE',
    message: `${field[0].toUpperCase() + field.slice(1)} can be either of these: ${enums.toString()}.`
  }),
  FIELD_IS_NOT_DEFINED: (field) => ({
    code: 'FIELD_IS_NOT_DEFINED',
    message: `${field} field should be defined.`
  }),
  FIELD_IS_NOT_OF_PROPER_TYPE: (field, type) => ({
    code: 'FIELD_IS_NOT_OF_PROPER_TYPE',
    message: `${field} should be of type ${type}.`
  }),
  FIELD_IS_NOT_OF_PROPER_LENGTH: (field, length) => {
    const lengthLimitMessages = []
    length.min && lengthLimitMessages.push(`shorter than ${length.min}`)
    length.max && lengthLimitMessages.push(`longer than ${length.max}`)

    const message = `${field} cannot be ${lengthLimitMessages.join(' and ')} characters.`

    return {
      code: 'FIELD_IS_NOT_OF_PROPER_LENGTH',
      message
    }
  },
  FIELD_IS_NOT_IN_RANGE: (field, range) => ({
    code: 'FIELD_IS_NOT_IN_RANGE',
    message: `${field} should be in range from ${range.min} to ${range.max}.`
  }),
  NAME_FIELD_IS_NOT_OF_PROPER_FORMAT: (field) => ({
    code: 'NAME_NOT_VALID',
    message: `${field} can contain alphabetic characters only.`
  }),
  FIELD_IS_NOT_OF_PROPER_FORMAT: (field) => validationErrors[field],
  FIELD_IS_NOT_OF_PROPER_ENUM_VALUE: (field, enumSet) => ({
    code: 'FIELD_IS_NOT_OF_PROPER_ENUM_VALUE',
    message: `${field} should be either one of the values: [${enumSet.join(', ')}].`
  }),
  ROLE_REQUIRED_FOR_ACTION: (role) => ({
    code: 'ROLE_REQUIRED_FOR_ACTION',
    message: `Only ${role} can perform this action.`
  }),
  CHAT_ALREADY_EXISTS: {
    code: 'CHAT_ALREADY_EXISTS',
    message: 'The chat with this user already exists.'
  },
  ALREADY_REGISTERED: {
    code: 'ALREADY_REGISTERED',
    message: 'User with the specified email already exists.'
  },
  EMAIL_ALREADY_CONFIRMED: {
    code: 'EMAIL_ALREADY_CONFIRMED',
    message: 'User email has been already confirmed.'
  },
  EMAIL_NOT_CONFIRMED: {
    code: 'EMAIL_NOT_CONFIRMED',
    message: 'Please confirm your email to login.'
  },
  WRONG_CURRENT_PASSWORD: {
    code: 'WRONG_CURRENT_PASSWORD',
    message: 'Wrong current password.'
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'The requested URL was not found.'
  },
  OBJECT_MUST_HAVE_PROPERTY: (field) => ({
    code: 'OBJECT_MUST_HAVE_PROPERTY',
    message: `${field} must have at least one property.`
  }),
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'You do not have permission to perform this action.'
  },
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    message: 'The request could not be processed due to invalid or missing parameters.'
  },
  CANNOT_TARGET_SELF: {
    code: 'CANNOT_TARGET_SELF',
    message: 'You cannot perform this action on yourself.'
  },
  BAD_CONFIRM_TOKEN: {
    code: 'BAD_CONFIRM_TOKEN',
    message: 'The confirm token is either invalid or has expired.'
  },
  BAD_REFRESH_TOKEN: {
    code: 'BAD_REFRESH_TOKEN',
    message: 'The refresh token is either invalid or has expired.'
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'The requested URL requires user authorization.'
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR'
  },
  TEMPLATE_NOT_FOUND: {
    code: 'TEMPLATE_NOT_FOUND',
    message: 'The requested template was not found.'
  },
  BAD_RESET_TOKEN: {
    code: 'BAD_RESET_TOKEN',
    message: 'The reset token is either invalid or has expired.'
  },
  INVALID_TOKEN_NAME: {
    code: 'INVALID_TOKEN_NAME',
    message: 'The token name you used is invalid.'
  },
  INVALID_ID: {
    code: 'INVALID_ID',
    message: 'ID is invalid.'
  },
  API_TOKEN_NOT_RETRIEVED: {
    code: 'API_TOKEN_NOT_RETRIEVED',
    message: 'The access token has not been retrieved.'
  },
  EMAIL_NOT_SENT: {
    code: 'EMAIL_NOT_SENT',
    message: 'Email has not been sent.'
  },
  INVALID_LANGUAGE: {
    code: 'INVALID_LANGUAGE',
    message: `The language name is invalid. Possible options: ${APP_LANG_ENUM.join(', ')}.`
  },
  READ_ONLY_ERROR: {
    code: 'READ_ONLY_ERROR',
    message: 'Modification commands are disabled in read-only mode.'
  },
  DOCUMENT_NOT_FOUND: (document) => ({
    code: 'DOCUMENT_NOT_FOUND',
    message: `${document} with the specified ${document.length > 1 ? 'IDs were' : 'ID was'} not found.`
  }),
  FIELD_CANNOT_BE_EMPTY: (field) => `The ${field} field cannot be empty.`,
  FIELD_MUST_BE_SELECTED: (field) => `${field[0].toUpperCase() + field.slice(1)} must be selected.`,
  ENUM_CAN_BE_ONE_OF: (field, enums) =>
    `${field[0].toUpperCase() + field.slice(1)} can be either of these: ${enums.toString()}`,
  FIELD_CANNOT_BE_LONGER: (field, quantity) =>
    `${field[0].toUpperCase() + field.slice(1)} cannot be longer than ${quantity} symbol.`,
  FIELD_CANNOT_BE_SHORTER: (field, quantity) =>
    `${field[0].toUpperCase() + field.slice(1)} cannot be shorter than ${quantity} symbol.`,
  VALUE_MUST_BE_ABOVE: (field, val) =>
    val === 1
      ? `${field[0].toUpperCase() + field.slice(1)} must be a positive number.`
      : `${field[0].toUpperCase() + field.slice(1)} must be above ${val}.`,
  VALUE_MUST_BE_BELOW: (field, val) => `${field[0].toUpperCase() + field.slice(1)} must be below ${val}.`,
  DOCUMENT_ALREADY_EXISTS: (uniqueFields) => ({
    code: 'DOCUMENT_ALREADY_EXISTS',
    message: `'${uniqueFields}' field(s) must be unique.`
  }),
  MONGO_SERVER_ERROR: (message) => ({
    code: 'MONGO_SERVER_ERROR',
    message: message
  }),
  VALIDATION_ERROR: (message) => ({
    code: 'VALIDATION_ERROR',
    message: message
  }),
  RESTRICTED_PATH: (functionName, path) => ({
    code: 'RESTRICTED_PATH_ERROR',
    message: `The function ${functionName} is restricted in files under the ${path} path!`
  })
}

const validationErrors = {
  email: {
    code: 'EMAIL_NOT_VALID',
    message: 'Email should be of the following format: “local-part@domain.com”.'
  },
  password: {
    code: 'PASSWORD_NOT_VALID',
    message: 'Password must contain at least one alphabetic and one numeric character.'
  },
  firstName: errors.NAME_FIELD_IS_NOT_OF_PROPER_FORMAT('firstName'),
  lastName: errors.NAME_FIELD_IS_NOT_OF_PROPER_FORMAT('lastName'),
  videoLink: {
    code: 'VIDEO_LINK_NOT_VALID',
    message: 'Video link should be a valid youtube URL.'
  },
  photo: {
    code: 'PHOTO_NOT_VALID',
    message: 'Photo must either have name and a src or be an empty string to remove it.'
  }
}

module.exports = errors
