const { MongoClient } = require('mongodb')

const { up, down } = require('@root/migrations/20250114190204-enhance-need-action-in-cooperations')

require('~/initialization/envSetup')
const {
  config: { MONGODB_URL }
} = require('~/configs/config')

const url = MONGODB_URL.slice(0, MONGODB_URL.lastIndexOf('/'))
const databaseName = MONGODB_URL.slice(MONGODB_URL.lastIndexOf('/') + 1)

describe('20250114190204-enhance-need-action-in-cooperations', () => {
  let client, database
  beforeAll(() => {
    client = new MongoClient(url)
    database = client.db(databaseName)
  })

  beforeEach(async () => {
    await database.collection('cooperation').deleteMany({})

    await database.collection('cooperation').insertMany([{ needAction: 'tutor' }, { needAction: 'student' }])
  })

  afterAll(async () => {
    await up(database)
    client.close()
  })

  it('should run the migration up and transform needAction field', async () => {
    await up(database)
    const updatedDocuments = await database.collection('cooperation').find({}).toArray()
    expect(updatedDocuments).toHaveLength(2)
    expect(updatedDocuments[0].needAction).toHaveProperty('role', 'tutor')
    expect(updatedDocuments[0].needAction).toHaveProperty('type', 'price')
    expect(updatedDocuments[0].needAction).toHaveProperty('messages')
    expect(Array.isArray(updatedDocuments[0].needAction.messages)).toBe(true)
  })

  it('should run the migration down and revert the needAction field', async () => {
    await down(database)
    const updatedDocuments = await database.collection('cooperation').find({}).toArray()
    expect(updatedDocuments).toHaveLength(2)
    expect(updatedDocuments[0].needAction).toBe('tutor')
    expect(updatedDocuments[1].needAction).toBe('student')
  })
})
