const User = require('~/models/user')
const { hashPassword } = require('~/utils/passwordHelper')

const testUserAuthentication = async (app, userData = {}) => {
  const qtyOfMandatorySignupFields = 5
  let testUser
  if (Object.keys(userData).length < qtyOfMandatorySignupFields) {
    testUser = {
      role: userData.role ? userData.role : 'student',
      firstName: 'Tart',
      lastName: 'Drilling',
      email: 'tartdrilling@gmail.com',
      password: 'Qwerty123@',
      FAQ: { student: [{ question: 'question1', answer: 'answer1' }] },
      isEmailConfirmed: true,
      lastLoginAs: userData.role ? userData.role : 'student'
    }
  }

  const hashedPassword = await hashPassword(testUser.password)

  await User.create({ ...testUser, password: hashedPassword })

  const loginUserResponse = await app.post('/auth/login').send({ email: testUser.email, password: testUser.password })

  return loginUserResponse.body.accessToken
}

module.exports = testUserAuthentication
