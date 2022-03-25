const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const { JWT } = require('~/consts/auth')

const createToken = (id) => {
  return jwt.sign({id}, JWT.SECRET, {
    expiresIn: JWT.MAX_AGE
  })
}

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

const comparePasswords = async (password, userPassword) => {
  return await bcrypt.compare(password, userPassword)
}

module.exports = {
  createToken,
  hashPassword,
  comparePasswords
}
