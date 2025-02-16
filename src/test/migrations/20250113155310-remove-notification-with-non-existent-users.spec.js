const mongoose = require('mongoose')

const Notifications = require('~/models/notification')
const Users = require('~/models/user')
const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const migration = require('@root/migrations/20250113155310-remove-notification-with-non-existent-users')

describe('Migration - Remove notifications with non-existent users', () => {
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

  const insertNotifications = async (data) => {
    await Notifications.insertMany(data)
  }

  const getNotifications = async () => {
    return Notifications.find({}).lean()
  }

  it('Should remove notifications with non-existent users', async () => {
    const existingUser1 = new mongoose.Types.ObjectId()
    const existingUser2 = new mongoose.Types.ObjectId()
    const ghost = new mongoose.Types.ObjectId()

    await insertUsers([
      {
        _id: existingUser1,
        firstName: 'Bruce',
        lastName: 'Wayne',
        email: 'bruceww@gmail.com',
        password: 'wHeReIsThEdEtOnAtOr2012'
      },
      {
        _id: existingUser2,
        firstName: 'Peter',
        lastName: 'Parker',
        email: 'p_parker@gmail.com',
        password: 'sPiDeYsEnSe2002'
      }
    ])

    const existingNotification1 = {
      _id: new mongoose.Types.ObjectId(),
      user: existingUser1,
      userRole: 'student',
      type: 'active',
      reference: new mongoose.Types.ObjectId(),
      referenceModel: 'Cooperation'
    }

    const existingNotification2 = {
      _id: new mongoose.Types.ObjectId(),
      user: existingUser2,
      userRole: 'student',
      type: 'active',
      reference: new mongoose.Types.ObjectId(),
      referenceModel: 'Cooperation'
    }

    const ghostNotification = {
      _id: new mongoose.Types.ObjectId(),
      user: ghost,
      userRole: 'student',
      type: 'active',
      reference: new mongoose.Types.ObjectId(),
      referenceModel: 'Cooperation'
    }

    await insertNotifications([existingNotification1, existingNotification2, ghostNotification])

    await migration.up(mongoose.connection.db)

    const remainingNotifications = await getNotifications()

    expect(remainingNotifications).toHaveLength(2)
    expect(remainingNotifications[0]._id.toString()).toBe(existingNotification1._id.toString())
  })
})
