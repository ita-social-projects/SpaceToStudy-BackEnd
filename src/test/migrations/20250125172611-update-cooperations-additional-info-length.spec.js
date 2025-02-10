const mongoose = require('mongoose')
const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const Cooperation = require('~/models/cooperation')

const migration = require('@root/migrations/20250125172611-update-cooperations-additional-info-length')

const cooperationData = {
  offer: '6739b6993decba1e46b66a26',
  initiator: '5f5f5f5f5f5f5f5f5f5f5f5f',
  initiatorRole: 'student',
  receiver: '673615d36b214652201af558',
  receiverRole: 'tutor',
  proficiencyLevel: 'Beginner',
  price: 500,
  status: 'active',
  needAction: {
    role: 'student',
    type: 'price',
    messages: []
  },
  availableQuizzes: [],
  finishedQuizzes: [],
  sections: []
}

const validCooperation = {
  ...cooperationData,
  title: 'valid cooperation',
  additionalInfo: 'this additionalInfo field length is greater that 30 characters'
}

const invalidCooperation = {
  ...cooperationData,
  title: 'invalid cooperation',
  additionalInfo: 'length is less that 30 before update'
}

describe('20250125172611-update-cooperations-additional-info-length', () => {
  let server

  beforeAll(async () => ({ server } = await serverInit()))

  afterEach(async () => await serverCleanup())

  afterAll(async () => {
    await stopServer(server)
  })

  test('should increase additionalInfo field length for invalid cooperations', async () => {
    const invalidCooperationBeforeUpdate = await Cooperation.create(invalidCooperation)
    await Cooperation.create(validCooperation)

    await Cooperation.updateOne(
      { _id: invalidCooperationBeforeUpdate._id },
      { $set: { additionalInfo: 'less than 30' } }
    )

    await migration.up(mongoose.connection.db)

    const invalidCooperationAfterMigration = await Cooperation.findOne({ title: invalidCooperation.title })
    const validCooperationAfterMigration = await Cooperation.findOne({ title: validCooperation.title })

    expect(invalidCooperationAfterMigration.additionalInfo.length).toBeGreaterThanOrEqual(30)
    expect(validCooperationAfterMigration.additionalInfo).toBe(validCooperation.additionalInfo)
  })
})
