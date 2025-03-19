const { setupTestServer, stopServer } = require('~/test/setupSafeTest')

const {
  enums: { ROLE_ENUM, NOTIFICATION_TYPE_ENUM }
} = require('~/consts/validation')

const User = require('~/models/user')
const Notification = require('~/models/notification')

const notificationFields = ['user', 'userRole', 'reference', 'referenceModel', 'createdAt', 'updatedAt', '_id']

describe('Notification model', () => {
  let server

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should have all required fields', async () => {
    const fields = await Notification.find({})

    for (const field of fields) {
      notificationFields.forEach((notificationField) => {
        expect(field).toHaveProperty(notificationField)
      })
    }
  })

  it('should have valid fields data types', async () => {
    const notifications = await Notification.find({})

    for (const notification of notifications) {
      expect(typeof notification.user).toBe('object')
      expect(typeof notification.userRole).toBe('string')
      expect(typeof notification.type).toBe('string')
      expect(typeof notification.reference).toBe('object')
      expect(typeof notification.referenceModel).toBe('string')
      expect(notification.createdAt).toBeInstanceOf(Date)
      expect(notification.updatedAt).toBeInstanceOf(Date)
    }
  })

  it('should have valid user references', async () => {
    const notifications = await Notification.find({}).select({ user: true }).populate('user')

    for (const notification of notifications) {
      expect(notification.user).toBeInstanceOf(User)
    }
  })

  it('should have non-null required fields', async () => {
    const notifications = await Notification.find({}).select({
      user: true,
      userRole: true,
      reference: true,
      referenceModel: true
    })

    for (const notification of notifications) {
      expect(notification.user).not.toBeNull()
      expect(notification.userRole).not.toBeNull()
      expect(notification.reference).not.toBeNull()
      expect(notification.referenceModel).not.toBeNull()
    }
  })

  it('should have valid enum values', async () => {
    const notifications = await Notification.find({}).select({ userRole: true, type: true })

    for (const notification of notifications) {
      expect(ROLE_ENUM).toContain(notification.userRole)
      expect(NOTIFICATION_TYPE_ENUM).toContain(notification.type)
    }
  })
})
