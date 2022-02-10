const jwt = require('jsonwebtoken')

const JWT_MAX_AGE = '24h'
const JWT_SECRET = 'SOME SECRET STRING'

exports.createToken = (id) => {
  return jwt.sign({id}, JWT_SECRET, {
    expiresIn: JWT_MAX_AGE
  })
}
