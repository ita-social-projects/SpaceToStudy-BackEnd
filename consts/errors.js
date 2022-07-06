const errors = {
  USER_NOT_REGISTERED: {
    code: 'USER_NOT_REGISTERED',
    message: 'User is not registered.'
  },
  INCORRECT_CREDENTIALS: {
    code: 'INCORRECT_CREDENTIALS',
    message: 'Wrong email or password.'
  },
  ROLE_NOT_SUPPORTED: {
    code: 'ROLE_NOT_SUPPORTED',
    message: 'User role is not supported.'
  },
  PASSWORD_LENGTH_VALIDATION_FAILED: {
    code: 'PASSWORD_LENGTH_VALIDATION_FAILED',
    message: 'password: Password cannot be shorter than 8 and longer than 25 characters.'
  },
  ALREADY_REGISTERED: {
    code: 'ALREADY_REGISTERED',
    message: 'User already exists.'
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'The requested URL was not found.'
  },
  BAD_ACTIVATION_LINK: {
    code: 'BAD_ACTIVATION_LINK',
    message: 'User activation link is incorrect.'
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'User is not authorized.'
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR'
  }
}

module.exports = errors
