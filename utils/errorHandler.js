const { errorMessages } = require('~/consts/auth')

exports.handleErrors = (err) => {
  console.log('err.errors', err.errors)
  console.log('err.message', err.message)
  let errors = {}

  if (err.message === errorMessages.INCORRECT_CREDENTIALS) {
    errors.login = 'incorrect email or password'
    return errors
  }
  if (err.code === 11000) {
    errors.email = 'email is already registered'
    return errors
  }
  if (err.message.toLowerCase().includes('user validation failed')) {
    Object.values(err.errors).forEach(({properties}) => {
      errors[properties.path] = properties.message
    })
  }

  return (errors)
}
