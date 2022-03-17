const { authErr } = require('~/consts/errors')

exports.handleErrors = (err, req, res, next) => {
  console.log(err)

  if (err.message.toLowerCase().includes('user validation failed')) {
    let errors = {}
    Object.values(err.errors).forEach(({properties}) => {
      errors[properties.path] = properties.message
    })
    res.status(422).json({ message: 'Mongo validation error', errors})
  }
  if (err.message === authErr.ALREADY_REGISTERED) res.status(409).json( { message: authErr.ALREADY_REGISTERED } )
  if (err.message === authErr.PASS_LENGTH) res.status(422).json( { message: authErr.PASS_LENGTH } )
  if (err.message === authErr.INCORRECT_CREDENTIALS) res.status(401).json( { message: authErr.INCORRECT_CREDENTIALS } )
  
  res.status(500).json( { message: 'UNHANDLED_ERROR, process it!' } )
}
