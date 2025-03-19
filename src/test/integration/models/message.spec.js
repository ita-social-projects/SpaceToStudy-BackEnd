const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const Message = require('~/models/message')

const messageFields = [
  'author',
  'authorRole',
  'text',
  'isRead',
  'isNotified',
  'chat',
  'clearedFor',
  'createdAt',
  'updatedAt'
]
const { enums } = require('~/consts/validation')

describe('Message model', () => {
  let server, messages

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server

    messages = await Message.find({})
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should have all the required fields', () => {
    for (const message of messages) {
      messageFields.forEach((item) => {
        expect(message).toHaveProperty(item)
      })
    }
  })

  it('should have all valid field data types', () => {
    for (const message of messages) {
      expect(typeof message.author).toBe('object')
      expect(typeof message.authorRole).toBe('string')
      expect(typeof message.text).toBe('string')
      expect(typeof message.chat).toBe('object')
      expect(typeof message.clearedFor).toBe('object')
      expect(message.createdAt).toBeInstanceOf(Date)
      expect(message.updatedAt).toBeInstanceOf(Date)
    }
  })

  it('should have non-null required fields', () => {
    for (const message of messages) {
      expect(message.author).not.toBeNull()
      expect(message.authorRole).not.toBeNull()
      expect(message.chat).not.toBeNull()
    }
  })

  it('should have valid authorRole values', () => {
    for (const message of messages) {
      expect(enums.MAIN_ROLE_ENUM).toContain(message.authorRole)
    }
  })

  it('should have text field within valid length constraints', () => {
    for (const message of messages) {
      expect(message.text.length).toBeGreaterThanOrEqual(1)
      expect(message.text.length).toBeLessThanOrEqual(1000)
    }
  })
})
