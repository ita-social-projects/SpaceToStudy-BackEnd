const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const Chat = require('~/models/chat')

describe('Chat Model', () => {
  let server

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should validate that all members.user in chats reference existing users', async () => {
    const chats = await Chat.find({}).populate('members.user')

    for (const chat of chats) {
      chat.members.forEach((member) => {
        expect(member.user).toBeDefined()
        expect(member.user).not.toBeNull()
        expect(member.user).toHaveProperty('firstName')
      })
    }
  })

  it('should validate that deletedFor.user in chats references existing users', async () => {
    const chats = await Chat.find({}).populate('deletedFor.user')

    for (const chat of chats) {
      chat.deletedFor.forEach((deletedEntry) => {
        expect(deletedEntry.user).toBeDefined()
        expect(deletedEntry.user).not.toBeNull()
        expect(deletedEntry.user).toHaveProperty('firstName')
      })
    }
  })

  it('should validate that latestMessage in chats references an existing message', async () => {
    const chats = await Chat.find({}).populate('latestMessage')

    for (const chat of chats) {
      if (chat.latestMessage) {
        expect(chat.latestMessage).toBeDefined()
        expect(chat.latestMessage).not.toBeNull()
        expect(chat.latestMessage).toHaveProperty('text')
      }
    }
  })

  it('should validate timestamps exist and are correct', async () => {
    const chats = await Chat.find({})
    for (const chat of chats) {
      expect(chat).toHaveProperty('createdAt')
      expect(chat).toHaveProperty('updatedAt')
      expect(new Date(chat.createdAt).getTime()).toBeLessThanOrEqual(Date.now())
      expect(new Date(chat.updatedAt).getTime()).toBeLessThanOrEqual(Date.now())
    }
  })

  it('should validate the role field contains a valid value', async () => {
    const chats = await Chat.find({})
    for (const chat of chats) {
      chat.members.forEach((member) => {
        expect(Chat.schema.path('members.role').enumValues).toContain(member.role)
      })
    }
  })
})
