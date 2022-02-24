const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const { JWT } = require('~/consts/auth')

exports.createToken = (id) => {
  return jwt.sign({id}, JWT.SECRET, {
    expiresIn: JWT.MAX_AGE
  })
}

exports.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

exports.comparePasswords = async (password, userPassword) => {
  return await bcrypt.compare(password, userPassword)
}
