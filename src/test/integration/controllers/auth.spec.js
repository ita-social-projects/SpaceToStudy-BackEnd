const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const { expectError } = require('~/test/helpers')
const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const tokenService = require('~/services/token')
const authController = require('~/controllers/auth')
const testUserAuthentication = require('~/utils/testUserAuth')
const errors = require('~/consts/errors')
const {
  lengths: { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH },
  enums: { ROLE_ENUM }
} = require('~/consts/validation')
const {
  tokenNames: { RESET_TOKEN, ACCESS_TOKEN },
  oneDayInMs,
  thirtyDaysInMs
} = require('~/consts/auth')

jest.mock('google-auth-library')

describe('Auth controller', () => {
  let app, server, signupResponse

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    signupResponse = await app.post('/auth/signup').send(user)
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  const user = {
    role: 'student',
    firstName: 'test',
    lastName: 'test',
    email: 'test@gmail.com',
    password: 'testpass_135'
  }

  describe('Signup endpoint', () => {
    it('should register a user', async () => {
      user._id = signupResponse.body.userId

      expect(signupResponse.statusCode).toBe(201)
      expect(signupResponse.body).toEqual(expect.objectContaining({ userEmail: user.email }))
    })

    it('should throw validation errors for the firstName field', async () => {
      const responseForFormat = await app.post('/auth/signup').send({ ...user, firstName: '12345' })
      const responseForNull = await app.post('/auth/signup').send({ ...user, firstName: null })

      const formatError = errors.NAME_FIELD_IS_NOT_OF_PROPER_FORMAT('firstName')
      const nullError = errors.FIELD_IS_NOT_DEFINED('firstName')
      expectError(422, formatError, responseForFormat)
      expectError(422, nullError, responseForNull)
    })

    it('should throw validation errors for the email format', async () => {
      const responseForFormat = await app.post('/auth/signup').send({ ...user, email: 'test' })
      const responseForType = await app.post('/auth/signup').send({ ...user, email: 312938 })

      const formatError = errors.FIELD_IS_NOT_OF_PROPER_FORMAT('email')
      const typeError = errors.FIELD_IS_NOT_OF_PROPER_TYPE('email', 'string')
      expectError(422, formatError, responseForFormat)
      expectError(422, typeError, responseForType)
    })

    it('should throw validation error for the role value', async () => {
      const signupResponse = await app.post('/auth/signup').send({ ...user, role: 'test' })

      const error = errors.FIELD_IS_NOT_OF_PROPER_ENUM_VALUE('role', ROLE_ENUM)
      expectError(422, error, signupResponse)
    })

    it('should throw validation errors for the password`s length', async () => {
      const responseForMax = await app
        .post('/auth/signup')
        .send({ ...user, password: '1'.repeat(MAX_PASSWORD_LENGTH + 1) })

      const responseForMin = await app
        .post('/auth/signup')
        .send({ ...user, password: '1'.repeat(MIN_PASSWORD_LENGTH - 1) })

      const error = errors.FIELD_IS_NOT_OF_PROPER_LENGTH('password', {
        min: MIN_PASSWORD_LENGTH,
        max: MAX_PASSWORD_LENGTH
      })
      expectError(422, error, responseForMax)
      expectError(422, error, responseForMin)
    })

    it('should throw ALREADY_REGISTERED error', async () => {
      await app.post('/auth/signup').send(user)

      const response = await app.post('/auth/signup').send(user)

      expectError(409, errors.ALREADY_REGISTERED, response)
    })
  })

  describe('Confirm email endpoint', () => {
    let confirmToken
    beforeEach(async () => {
      const findConfirmTokenResponse = await tokenService.findTokensWithUsersByParams({
        user: signupResponse.body.userId
      })
      confirmToken = findConfirmTokenResponse[0].confirmToken
    })

    it('should confirm email', async () => {
      const response = await app.get(`/auth/confirm-email/${confirmToken}`)

      expect(response.statusCode).toBe(204)
    })

    it('should throw EMAIL_ALREADY_CONFIRMED error', async () => {
      await app.get(`/auth/confirm-email/${confirmToken}`)
      const response = await app.get(`/auth/confirm-email/${confirmToken}`)

      expectError(400, errors.EMAIL_ALREADY_CONFIRMED, response)
    })

    it('should throw BAD_CONFIRM_TOKEN error', async () => {
      const response = await app.get('/auth/confirm-email/invalid_token')

      expectError(400, errors.BAD_CONFIRM_TOKEN, response)
    })
  })

  describe('Login endpoint', () => {
    let confirmToken
    beforeEach(async () => {
      const findConfirmTokenResponse = await tokenService.findTokensWithUsersByParams({
        user: signupResponse.body.userId
      })
      confirmToken = findConfirmTokenResponse[0].confirmToken
    })

    it('should login a user with [ rememberMe = false ]', async () => {
      await app.get(`/auth/confirm-email/${confirmToken}`)

      const loginUserResponse = await app
        .post('/auth/login')
        .send({ email: user.email, password: user.password, rememberMe: false })

      expect(loginUserResponse.statusCode).toBe(200)
      expect(loginUserResponse.body).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String)
        })
      )

      const cookies = loginUserResponse.header['set-cookie']
      expect(cookies.some((cookie) => cookie.includes(`Max-Age=${oneDayInMs / 1000}`))).toBe(true)

      const refreshToken = cookies
        .find((cookie) => cookie.includes('refreshToken'))
        .split(';')[0]
        .split('=')[1]

      const decodedRefreshToken = jwt.decode(refreshToken)
      expect(decodedRefreshToken.exp).toBe(24 * 60 * 60 + Math.floor(Date.now() / 1000))
    })

    it('should login a user with [ rememberMe = true ]', async () => {
      await app.get(`/auth/confirm-email/${confirmToken}`)
      const loginUserResponse = await app
        .post('/auth/login')
        .send({ email: user.email, password: user.password, rememberMe: true })

      expect(loginUserResponse.statusCode).toBe(200)
      expect(loginUserResponse.body).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String)
        })
      )

      const cookies = loginUserResponse.header['set-cookie']
      expect(cookies.some((cookie) => cookie.includes(`Max-Age=${thirtyDaysInMs / 1000}`))).toBe(true)

      const refreshToken = cookies
        .find((cookie) => cookie.includes('refreshToken'))
        .split(';')[0]
        .split('=')[1]

      const decodedRefreshToken = jwt.decode(refreshToken)
      expect(decodedRefreshToken.exp).toBe(30 * 24 * 60 * 60 + Math.floor(Date.now() / 1000))
    })

    it('should throw INCORRECT_CREDENTIALS error', async () => {
      const response = await app.post('/auth/login').send({ email: 'invalid@gmail.com', password: 'invalid' })

      expectError(401, errors.USER_NOT_FOUND, response)
    })

    it('should throw INCORRECT_CREDENTIALS error', async () => {
      const response = await app.post('/auth/login').send({ email: user.email, password: 'invalid_pass' })

      expectError(401, errors.INCORRECT_CREDENTIALS, response)
    })

    it('should throw EMAIL_NOT_CONFIRMED error', async () => {
      const email = 'test2@gmail.com'
      await app.post('/auth/signup').send({ ...user, email })
      const response = await app.post('/auth/login').send({ email, password: user.password })

      expectError(401, errors.EMAIL_NOT_CONFIRMED, response)
    })
  })

  describe('Logout endpoint', () => {
    let confirmToken
    beforeEach(async () => {
      const findConfirmTokenResponse = await tokenService.findTokensWithUsersByParams({
        user: signupResponse.body.userId
      })
      confirmToken = findConfirmTokenResponse[0].confirmToken
    })

    it('should logout user', async () => {
      await app.get(`/auth/confirm-email/${confirmToken}`)

      const loginUserResponse = await app.post('/auth/login').send({ email: user.email, password: user.password })

      const refreshToken = loginUserResponse.header['set-cookie'][0].split(';')[0].split('=')[1]

      const logoutResponse = await app.post('/auth/logout').set('Cookie', `refreshToken=${refreshToken}`)

      expect(logoutResponse.statusCode).toBe(204)
    })
  })

  describe('RefreshAccessToken endpoint', () => {
    let confirmToken
    beforeEach(async () => {
      const findConfirmTokenResponse = await tokenService.findTokensWithUsersByParams({
        user: signupResponse.body.userId
      })
      confirmToken = findConfirmTokenResponse[0].confirmToken
    })

    it('should refresh access token', async () => {
      await app.get(`/auth/confirm-email/${confirmToken}`)

      const loginUserResponse = await app.post('/auth/login').send({ email: user.email, password: user.password })

      const refreshToken = loginUserResponse.header['set-cookie'][1].split(';')[0].split('=')[1]
      const accessToken = loginUserResponse.header['set-cookie'][0].split(';')[0].split('=')[1]

      const refreshResponse = await app
        .get('/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`, `accessToken=${accessToken}`])

      expect(refreshResponse.statusCode).toBe(200)
      expect(refreshResponse.body).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String)
        })
      )
    })

    it('should throw BAD_REFRESH_TOKEN error', async () => {
      const response = await app.get('/auth/refresh').set('Cookie', 'refreshToken=invalid-token')

      expectError(400, errors.BAD_REFRESH_TOKEN, response)
    })
  })

  describe('refreshAccessToken', () => {
    it('should clear cookies and return 401 if refreshToken is falsy', () => {
      const req = { cookies: { refreshToken: null } }
      const res = {
        clearCookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        end: jest.fn()
      }

      authController.refreshAccessToken(req, res)

      expect(res.clearCookie).toHaveBeenCalledWith(ACCESS_TOKEN)
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.end).toHaveBeenCalled()
    })
  })

  describe('SendResetPasswordEmail endpoint', () => {
    it('should send reset password email', async () => {
      const response = await app.post('/auth/forgot-password').send({ email: 'test@gmail.com' })

      expect(response.statusCode).toBe(204)
    })
    it('should throw USER_NOT_FOUND error', async () => {
      const response = await app.post('/auth/forgot-password').send({ email: 'invalid@gmail.com' })

      expectError(404, errors.USER_NOT_FOUND, response)
    })
  })

  describe('UpdatePassword endpoint', () => {
    let resetToken
    beforeEach(async () => {
      const { firstName, email, role } = user

      resetToken = tokenService.generateResetToken({ id: signupResponse.body.userId, firstName, email, role })

      await tokenService.saveToken(signupResponse.body.userId, resetToken, RESET_TOKEN)
    })

    it('should update a password', async () => {
      const response = await app.patch(`/auth/reset-password/${resetToken}`).send({ password: 'valid_pass1' })

      expect(response.statusCode).toBe(204)
    })

    it('should throw BAD_RESET_TOKEN error', async () => {
      const response = await app.patch('/auth/reset-password/invalid-token').send({ password: 'valid_pass1' })

      expectError(400, errors.BAD_RESET_TOKEN, response)
    })
  })

  describe('ChangePassword endpoint', () => {
    const CURRENT_PASSWORD = 'Qwerty123@'
    const WRONG_PASSWORD = 'Qwerty1@'

    const updateUserData = {
      password: 'testpass_1356',
      currentPassword: 'Qwerty123@'
    }

    let accessToken
    beforeEach(async () => {
      accessToken = await testUserAuthentication(app)
    })

    it('should change user password by his ID', async () => {
      const { id: currentUserId } = tokenService.validateAccessToken(accessToken)

      const response = await app
        .patch(`/auth/change-password/${currentUserId}`)
        .send(updateUserData)
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(204)
    })

    it('should throw WRONG_CURRENT_PASSWORD error', async () => {
      const { id: currentUserId } = tokenService.validateAccessToken(accessToken)

      const response = await app
        .patch(`/auth/change-password/${currentUserId}`)
        .send({ ...updateUserData, currentPassword: WRONG_PASSWORD })
        .set('Cookie', [`accessToken=${accessToken}`])

      expectError(400, errors.WRONG_CURRENT_PASSWORD, response)
    })

    it('should throw WRONG_CURRENT_PASSWORD error', async () => {
      const { id: currentUserId } = tokenService.validateAccessToken(accessToken)

      const response = await app
        .patch(`/auth/change-password/${currentUserId}`)
        .send({ ...updateUserData, password: CURRENT_PASSWORD })
        .set('Cookie', [`accessToken=${accessToken}`])

      expectError(400, errors.INCORRECT_CREDENTIALS, response)
    })
  })

  describe('GoogleAuth endpoint', () => {
    beforeEach(() => {
      const googleUser = { given_name: 'test', family_name: 'test', email: 'test@test.com', sub: '123456789' }

      const mockVerifyIdToken = jest.fn(() => ({
        getPayload: () => googleUser
      }))

      OAuth2Client.mockImplementation(() => {
        return {
          verifyIdToken: mockVerifyIdToken
        }
      })
    })
    afterEach(() => {
      jest.resetAllMocks()
    })

    const credential = 'test'

    it('should throw USER_NOT_FOUND if user doesn`t have account', async () => {
      const response = await app.post('/auth/google-auth').send({ token: { credential } })

      expectError(401, errors.USER_NOT_FOUND, response)
    })

    it('should register and log in user if user doesn`t have account', async () => {
      const role = 'tutor'
      const response = await app.post('/auth/google-auth').send({ token: { credential }, role })

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String)
        })
      )
    })
  })
})
