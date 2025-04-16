const User = require('~/models/user')
const { hashPassword } = require('~/utils/passwordHelper')

const testUserAuthentication = async (app, testUser = {}) => {
  const qtyOfMandatorySignupFields = 5
  if (Object.keys(testUser).length < qtyOfMandatorySignupFields) {
    // Safety check for Role array
    if (!testUser.role) testUser.lastLoginAs = 'student'
    else if (Array.isArray(testUser.role)) testUser.lastLoginAs = testUser.role[0] || 'student'
    else testUser.lastLoginAs = testUser.role

    testUser = {
      role: testUser.role ? testUser.role : 'student',
      firstName: 'Tart',
      lastName: 'Drilling',
      email: 'tartdrilling@gmail.com',
      password: process.env.DEFAULT_PASSWORD || 'Qwerty123@',
      FAQ: { student: [{ question: 'question1', answer: 'answer1' }] },
      isEmailConfirmed: true,
      lastLoginAs: testUser.lastLoginAs
    }
  }

  const hashedPassword = await hashPassword(testUser.password)

  await User.create({ ...testUser, password: hashedPassword })

  const loginUserResponse = await app.post('/auth/login').send({ email: testUser.email, password: testUser.password })

  return loginUserResponse.body.accessToken
}

module.exports = testUserAuthentication
