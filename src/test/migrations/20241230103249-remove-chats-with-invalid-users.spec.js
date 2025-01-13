const mongoose = require('mongoose')
const Chats = require('~/models/chat')
const Users = require('~/models/user')
const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const migration = require('@root/migrations/20241230103249-remove-chats-with-invalid-users')

describe('Migration - Remove chats with invalid members', () => {
  let server

  beforeAll(async () => {
    ;({ server } = await serverInit())
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  const insertUsers = async (data) => {
    await Users.insertMany(data)
  }

  const insertChats = async (data) => {
    await Chats.insertMany(data)
  }

  const getChats = async () => {
    return Chats.find({}).lean()
  }

  it('Should remove chats with invalid members or incorrect member count', async () => {
    const validUser1 = new mongoose.Types.ObjectId()
    const validUser2 = new mongoose.Types.ObjectId()
    const invalidUserId = new mongoose.Types.ObjectId()

    await insertUsers([
      {
        _id: validUser1,
        firstName: 'Mike',
        lastName: 'Popovych',
        email: 'volt@example.com',
        password: 'password1'
      },
      {
        _id: validUser2,
        firstName: 'Tony',
        lastName: 'Stark',
        email: 'stark@example.com',
        password: 'password2'
      }
    ])

    const validChat = {
      _id: new mongoose.Types.ObjectId(),
      members: [
        { user: validUser1, role: 'student' },
        { user: validUser2, role: 'tutor' }
      ]
    }

    const invalidChatWithInvalidUser = {
      _id: new mongoose.Types.ObjectId(),
      members: [
        { user: validUser1, role: 'student' },
        { user: invalidUserId, role: 'tutor' }
      ]
    }

    const invalidChatWithSingleMember = {
      _id: new mongoose.Types.ObjectId(),
      members: [{ user: validUser1, role: 'student' }]
    }

    await insertChats([validChat, invalidChatWithInvalidUser, invalidChatWithSingleMember])

    await migration.up(mongoose.connection.db)

    const remainingChats = await getChats()

    expect(remainingChats).toHaveLength(1)
    expect(remainingChats[0]._id.toString()).toBe(validChat._id.toString())
  })

  it('Should do nothing in the down migration', async () => {
    await expect(migration.down(mongoose.connection.db)).resolves.not.toThrow()
  })
})
