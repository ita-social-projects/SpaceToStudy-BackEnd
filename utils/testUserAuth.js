const User = require('~/models/user')
const { hashPassword } = require('~/utils/passwordHelper')

const testUserAuthentication = async (app, testUser = {}) => {
  const qtyOfMandatorySignupFields = 5
  if (Object.keys(testUser).length < qtyOfMandatorySignupFields) {
    testUser = {
      role: 'student',
      firstName: 'Tart',
      lastName: 'Drilling',
      email: 'tartdrilling@gmail.com',
      password: 'Qwerty123@',
      isEmailConfirmed: true,
      lastLoginAs: 'student'
    }
  }

  const hashedPassword = await hashPassword(testUser.password)

  await User.create({ ...testUser, password: hashedPassword })

  const loginUserResponse = await app.post('/auth/login').send({ email: testUser.email, password: testUser.password })

  return loginUserResponse.body.accessToken
}

module.exports = testUserAuthentication
