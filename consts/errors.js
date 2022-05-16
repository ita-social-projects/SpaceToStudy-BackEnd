const errorCodes = {
  INCORRECT_CREDENTIALS: 'INCORRECT_CREDENTIALS',
  ROLE_NOT_SUPPORTED: 'ROLE_NOT_SUPPORTED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  ALREADY_REGISTERED: 'ALREADY_REGISTERED',
  NOT_FOUND: 'NOT_FOUND',
}

const errorMessages = {
  userRegistered: 'User already exists.',
  userNotRegistered: 'User is not registered.',
  emailLength: 'email: Input value is less than 8 or more than 25 characters.',
  passMismatch: 'Passwords do not match.',
}

module.exports = {
  errorCodes,
  errorMessages,
}
