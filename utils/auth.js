const jwt = require('jsonwebtoken')

const { JWT } = require('~/consts/auth')

exports.createToken = (id) => {
  return jwt.sign({id}, JWT.SECRET, {
    expiresIn: JWT.MAX_AGE
  })
}
