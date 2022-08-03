const bcrypt = require('bcrypt')

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

const comparePasswords = async (password, userPassword) => {
  return await bcrypt.compare(password, userPassword)
}

module.exports = {
  hashPassword,
  comparePasswords
}
