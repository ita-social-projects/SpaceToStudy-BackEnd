exports.handleErrors = (err) => {
  console.log(err.errors)
  let errors = {}

  if (err.code === 11000) {
    errors.email = 'SOME MESSAGE THAT HANDLES ALREADY REGISTERED EMAIL ERROR'
    return errors
  }
  if (err.message.toLowerCase().includes('user validation failed')) {
    Object.values(err.errors).forEach(({properties}) => {
      errors[properties.path] = properties.message
    })
  }

  return (errors)
}
