const superAdmin = {
  firstName: process.env.MAIL_FIRSTNAME,
  lastName: process.env.MAIL_LASTNAME,
  email: process.env.MAIL_USER,
  password: process.env.MAIL_PASS
}

module.exports = {
  superAdmin
}
