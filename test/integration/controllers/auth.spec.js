const { serverInit, serverCleanup } = require('~/test/setup')
const {
  lengths: { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH },
  enums: { ROLE_ENUM }
} = require('~/consts/validation')
const errors = require('~/consts/errors')
const tokenService = require('~/services/token')
const Token = require('~/models/token')
const { expectError } = require('~/test/helpers')

describe('Auth controller', () => {
  let app, server

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  afterAll(async () => {
    await serverCleanup(server)
  })

  const user = {
    _id: null,
    role: 'student',
    firstName: 'test',
    lastName: 'test',
    email: 'test@gmail.com',
    password: 'testpass_135'
  }
  describe('Signup endpoint', () => {
    it('should register a user', async () => {
      const response = await app.post('/auth/signup').send(user)
      user._id = response.body.userId

      expect(response.statusCode).toBe(201)
      expect(response.body).toEqual(expect.objectContaining({ userEmail: user.email }))
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
      const response = await app.post('/auth/signup').send({ ...user, role: 'test' })

      const error = errors.FIELD_IS_NOT_OF_PROPER_ENUM_VALUE('role', ROLE_ENUM)
      expectError(422, error, response)
    })

    it("should throw validation errors for the password's length", async () => {
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
      const response = await app.post('/auth/signup').send(user)

      expectError(409, errors.ALREADY_REGISTERED, response)
    })
  })

  describe('Confirm email endpoint', () => {
    let confirmToken
    beforeAll(() => {
      confirmToken = tokenService.generateConfirmToken({ id: user._id })
      Token.findOne = jest.fn().mockResolvedValue({ confirmToken })
    })
    afterAll(() => jest.resetAllMocks())

    it('should confirm email', async () => {
      const response = await app.get(`/auth/confirm-email/${confirmToken}`)

      expect(response.statusCode).toBe(204)
    })

    it('should throw EMAIL_ALREADY_CONFIRMED error', async () => {
      const response = await app.get(`/auth/confirm-email/${confirmToken}`)

      expectError(400, errors.EMAIL_ALREADY_CONFIRMED, response)
    })

    it('should throw BAD_CONFIRM_TOKEN error', async () => {
      const response = await app.get('/auth/confirm-email/invalid_token')

      expectError(400, errors.BAD_CONFIRM_TOKEN, response)
    })
  })

  let refreshToken
  describe('Login endpoint', () => {
    it('should login a user', async () => {
      const response = await app.post('/auth/login').send({ email: user.email, password: user.password })
      refreshToken = response.header['set-cookie'][0].split(';')[0].split('=')[1]

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String)
        })
      )
    })

    it('should throw INCORRECT_CREDENTIALS error', async () => {
      const response = await app.post('/auth/login').send({ email: 'invalid@gmail.com', password: 'invalid' })

      expectError(401, errors.INCORRECT_CREDENTIALS, response)
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
    it('should logout user', async () => {
      const response = await app.post('/auth/logout').set('Cookie', `refreshToken=${refreshToken}`)

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({ deletedCount: 1 })
    })
  })

  describe('RefreshAccessToken endpoint', () => {
    it('should refresh access token', async () => {
      const response = await app.get('/auth/refresh').set('Cookie', `refreshToken=${refreshToken}`)

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(
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

  describe('SendResetPasswordEmail endpoint', () => {
    it('should send reset password email', async () => {
      const response = await app.post('/auth/forgot-password').send({ email: 'test@gmail.com' })

      expect(response.statusCode).toBe(204)
    })
    it('should throw EMAIL_NOT_FOUND error', async () => {
      const response = await app.post('/auth/forgot-password').send({ email: 'invalid@gmail.com' })

      expectError(404, errors.EMAIL_NOT_FOUND, response)
    })
  })

  describe('UpdatePassword endpoint', () => {
    let resetToken
    beforeAll(() => {
      resetToken = tokenService.generateResetToken({ id: user._id })
      Token.findOne = jest.fn().mockResolvedValue({ resetToken })
    })
    afterAll(() => jest.resetAllMocks())

    it('should update a password', async () => {
      const response = await app.patch(`/auth/reset-password/${resetToken}`).send({ password: 'valid_pass1' })

      expect(response.statusCode).toBe(204)
    })
    it('should throw BAD_RESET_TOKEN error', async () => {
      const response = await app.patch('/auth/reset-password/invalid-token').send({ password: 'valid_pass1' })

      expectError(400, errors.BAD_RESET_TOKEN, response)
    })
  })
})
