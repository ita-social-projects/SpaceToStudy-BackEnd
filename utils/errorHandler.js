const { authErr } = require('~/consts/errors')

exports.handleErrors = (err) => {
  console.log('err.errors', err.errors)
  console.log('err.message', err.message)
  let errors = {}

  if (err.message === authErr.INCORRECT_CREDENTIALS) {
    errors.login = authErr.INCORRECT_CREDENTIALS
    return errors
  }
  if (err.message === authErr.PASS_LENGTH) {
    errors.password = authErr.PASS_LENGTH
    return errors
  }
  if (err.code === 11000) {
    errors.email = authErr.ALREADY_REGISTERED
    return errors
  }
  if (err.message.toLowerCase().includes('user validation failed')) {
    Object.values(err.errors).forEach(({properties}) => {
      errors[properties.path] = properties.message
    })
  }

  return (errors)
}
