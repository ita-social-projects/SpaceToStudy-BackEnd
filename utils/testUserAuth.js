const tokenService = require('~/services/token')

const testUserAuthentication = async (app, testUser = {}) => {
  const qtyOfMandatorySignupFields = 5
  if (Object.keys(testUser).length < qtyOfMandatorySignupFields) {
    testUser = {
      role: 'student',
      firstName: 'Tart',
      lastName: 'Drilling',
      email: 'tartdrilling@gmail.com',
      password: 'Qwerty123@'
    }
  }

  const createUserResponse = await app.post('/auth/signup').send(testUser)
  testUser._id = createUserResponse.body.userId

  const findConfirmTokenResponse = await tokenService.findTokensWithUsersByParams({ user: testUser._id })
  const confirmToken = findConfirmTokenResponse[0].confirmToken
  await app.get(`/auth/confirm-email/${confirmToken}`)

  const loginUserResponse = await app.post('/auth/login').send({ email: testUser.email, password: testUser.password })

  return loginUserResponse.body.accessToken
}

module.exports = testUserAuthentication
