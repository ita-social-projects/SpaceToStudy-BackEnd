const mongoose = require('mongoose')
const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const Cooperation = require('~/models/cooperation')

const migration = require('@root/migrations/20250124143502-remove-cooperations-with-invalid-references')

const cooperation = {
  initiatorRole: 'student',
  receiverRole: 'tutor',
  title: 'Hawking radiation from supermassive black holes',
  price: 300,
  status: 'active',
  needAction: {
    role: 'student',
    type: 'price',
    messages: []
  },
  availableQuizzes: [],
  finishedQuizzes: [],
  sections: [],
  proficiencyLevel: 'Intermediate'
}

const initiatorData = {
  email: 'john_doe@example.com',
  password: 'password'
}

const receiverData = {
  email: 'jane_doe@example.com',
  password: 'password'
}

const offerData = {
  price: 300,
  proficiencyLevel: ['Intermediate'],
  title: 'Hawking radiation from supermassive black holes',
  description: 'Explore the phenomena of Hawking radiation and its implications for supermassive black holes.',
  languages: ['English'],
  authorRole: 'tutor',
  enrolledUsers: [],
  subject: '673617d99b9f19766f53f9f4',
  category: '64884f59fdc2d1a130c24ac8',
  status: 'active'
}

const insertTestData = async () => {
  const { insertedId: initiatorId } = await mongoose.connection.db.collection('users').insertOne(initiatorData)
  const { insertedId: receiverId } = await mongoose.connection.db.collection('users').insertOne(receiverData)
  const { insertedId: offerId } = await mongoose.connection.db.collection('offers').insertOne(offerData)

  return { initiatorId, receiverId, offerId }
}

describe('20250124143502-remove-cooperations-with-invalid-references', () => {
  let server

  beforeAll(async () => ({ server } = await serverInit()))

  afterEach(async () => await serverCleanup())

  afterAll(async () => {
    await stopServer(server)
  })

  const testInvalidReferences = async (referenceType) => {
    const { initiatorId, receiverId, offerId } = await insertTestData()
    const invalidReference = '5f5f5f5f5f5f5f5f5f5f5f5f'

    const invalidCooperation = {
      ...cooperation,
      initiator: referenceType === 'initiator' ? invalidReference : initiatorId,
      receiver: referenceType === 'receiver' ? invalidReference : receiverId,
      offer: referenceType === 'offer' ? invalidReference : offerId
    }

    await Cooperation.create(invalidCooperation)

    const validCooperation = {
      ...cooperation,
      initiator: initiatorId,
      receiver: receiverId,
      offer: offerId
    }

    await Cooperation.create(validCooperation)

    await migration.up(mongoose.connection.db)

    const invalidCooperationAfterMigration = await Cooperation.find({ [referenceType]: invalidReference })
    const validCooperationAfterMigration = await Cooperation.find({})

    expect(validCooperationAfterMigration).toHaveLength(1)
    expect(invalidCooperationAfterMigration).toHaveLength(0)
  }

  test('should remove cooperations with invalid initiators', async () => {
    await testInvalidReferences('initiator')
  })

  test('should remove cooperations with invalid receivers', async () => {
    await testInvalidReferences('receiver')
  })
  test('should remove cooperations with invalid offers', async () => {
    await testInvalidReferences('offer')
  })
})
