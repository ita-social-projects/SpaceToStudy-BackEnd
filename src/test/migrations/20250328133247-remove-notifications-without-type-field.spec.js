const mongoose = require('mongoose')
const Notification = require('~/models/notification')
const User = require('~/models/user')
const migration = require('@root/migrations/20250328133247-remove-notifications-without-type-field')
const { serverInit, serverCleanup, stopServer } = require('~/test/setup')

describe('Migration: Delete notifications without type (Cooperation reference)', () => {
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

  it('should delete notifications without "type" and keep valid ones (Cooperation)', async () => {
    const userId = new mongoose.Types.ObjectId()
    const cooperationId = new mongoose.Types.ObjectId()

    await User.insertMany([
      { _id: userId, firstName: 'User', lastName: 'One', email: 'user1@test.com', password: 'pass1234' }
    ])

    await Notification.insertMany([
      {
        user: userId,
        userRole: 'tutor',
        type: 'active',
        reference: cooperationId,
        referenceModel: 'Cooperation'
      },
      {
        user: userId,
        userRole: 'tutor',
        reference: cooperationId,
        referenceModel: 'Cooperation'
      }
    ])

    await migration.up(mongoose.connection.db)

    const notifications = await Notification.find().lean()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].type).toBeDefined()
  })
})
