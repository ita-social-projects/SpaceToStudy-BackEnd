const errorCodes = {
  INCORRECT_CREDENTIALS: 'INCORRECT_CREDENTIALS',
  ROLE_NOT_SUPPORTED: 'ROLE_NOT_SUPPORTED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  ALREADY_REGISTERED: 'ALREADY_REGISTERED',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
}

const errorMessages = {
  userRegistered: 'User already exists.',
  userNotRegistered: 'User is not registered.',
  emailLength: 'email: Input value is less than 8 or more than 25 characters.',
  passMismatch: 'Passwords do not match.',
  badActivationLink: 'Bad activation link.',
  userNotAuthorized: 'User is not authorized.',
  wrongPath: 'Wrong path'
}

module.exports = {
  errorCodes,
  errorMessages
}
