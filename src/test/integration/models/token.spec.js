const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const Token = require('~/models/token')
const User = require('~/models/user')

describe('Token model', () => {
  let server

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should include all required fields', async () => {
    const tokens = await Token.find({})

    for (const token of tokens) {
      expect(token).toHaveProperty('user')
      expect(token).toHaveProperty('refreshToken')
      expect(token).toHaveProperty('resetToken')
      expect(token).toHaveProperty('confirmToken')
    }
  })

  it('should have valid fields data types', async () => {
    const tokens = await Token.find({})

    for (const token of tokens) {
      expect(typeof token.user).toBe('object')
      if (token.refreshToken) {
        expect(typeof token.refreshToken).toBe('string')
      }
      if (token.resetToken) {
        expect(typeof token.resetToken).toBe('string')
      }
      if (token.confirmToken) {
        expect(typeof token.confirmToken).toBe('string')
      }
    }
  })

  it('should validate user field references to User model', async () => {
    const tokens = await Token.find({})

    for (const token of tokens) {
      expect(token.user).not.toBeNull()

      const user = await User.findById(token.user)
      expect(user).not.toBeNull()
      expect(user).toBeInstanceOf(User)
    }
  })

  it('should allow resetToken to be null', async () => {
    const tokens = await Token.find({})

    for (const token of tokens) {
      if (token.resetToken === null) {
        expect(token.resetToken).toBeNull()
      }
    }
  })

  it('should handle optional fields correctly', async () => {
    const tokens = await Token.find({})

    for (const token of tokens) {
      if (token.refreshToken) {
        expect(token.refreshToken.trim()).not.toEqual('')
      }
      if (token.confirmToken) {
        expect(token.confirmToken.trim()).not.toEqual('')
      }
    }
  })
})
