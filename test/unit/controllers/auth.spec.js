const { serverInit, serverCleanup } = require('~/test/setup')
const { lengths: { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH }, enums: { ROLE_ENUM } } = require('~/consts/validation')
const { ALREADY_REGISTERED, NAME_FIELD_IS_NOT_OF_PROPER_FORMAT, FIELD_IS_NOT_OF_PROPER_LENGTH, FIELD_IS_NOT_OF_PROPER_FORMAT, FIELD_IS_NOT_DEFINED, FIELD_IS_NOT_OF_PROPER_ENUM_VALUE, FIELD_IS_NOT_OF_PROPER_TYPE } = require('~/consts/errors')

const expectError = (statusCode, error, response) => {
  expect(response.body).toEqual({
    ...error,
    status: statusCode
  })
}

describe('Auth controller', () => {
  let app, server

  beforeAll(async () => {
    ({ app, server } = await serverInit())
  })

  afterAll(async () => {
    await serverCleanup(server)
  })

  const user = {
    role: 'student',
    firstName: 'test',
    lastName: 'test',
    email: 'test@gmail.com',
    password: 'testpass_135',
  }
  describe('Signup endpoint', () => {

    it('should register a user', async () => {
      const response = await app.post('/auth/signup').send(user)

      expect(response.statusCode).toBe(201)
      expect(response.body).toEqual({ userEmail: user.email })
    })

    it('should throw validation error for the firstName field', async () => {
      const responseForFormat = await app.post('/auth/signup').send({ ...user, firstName: '12345' })
      const responseForNull = await app.post('/auth/signup').send({ ...user, firstName: null })

      const formatError = NAME_FIELD_IS_NOT_OF_PROPER_FORMAT('firstName')
      const nullError = FIELD_IS_NOT_DEFINED('firstName')
      expectError(422, formatError, responseForFormat)
      expectError(422, nullError, responseForNull)
    })

    it('should throw validation error for the email format', async () => {
      const responseForFormat = await app.post('/auth/signup').send({ ...user, email: 'test' })
      const responseForType = await app.post('/auth/signup').send({ ...user, email: 312938 })

      const formatError = FIELD_IS_NOT_OF_PROPER_FORMAT('email')
      const typeError = FIELD_IS_NOT_OF_PROPER_TYPE('email', 'string')
      expectError(422, formatError, responseForFormat)
      expectError(422, typeError, responseForType)
    })

    it('should throw validation error for the role value', async () => {
      const response = await app.post('/auth/signup').send({ ...user, role: 'test' })

      const error = FIELD_IS_NOT_OF_PROPER_ENUM_VALUE('role', ROLE_ENUM)
      expectError(422, error, response)
    })

    it('should throw validation error for the password\'s min / max length', async () => {
      const responseForMax = await app.post('/auth/signup').send({ ...user, password: '1'.repeat(MAX_PASSWORD_LENGTH + 1) })
      const responseForMin = await app.post('/auth/signup').send({ ...user, password: '1'.repeat(MIN_PASSWORD_LENGTH - 1) })

      const error = FIELD_IS_NOT_OF_PROPER_LENGTH('password', { min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH })
      expectError(422, error, responseForMax)
      expectError(422, error, responseForMin)
    })

    it('should throw an error if the user\'s already registered', async () => {
      const response = await app.post('/auth/signup').send(user)

      expectError(409, ALREADY_REGISTERED, response)
    })
  })

  xdescribe('Login endpoint', () => {
    it('should login a user', async () => {
      const response = await app.post('/auth/login').send({ email: user.email, password: user.password })

      expect(response.statusCode).toBe(200)
      // expect(response.body).toEqual({ userEmail: user.email })
    })
  })

})
