const { MongoClient, ObjectId } = require('mongodb')
const { up, down } = require('@root/migrations/20241222143712-add-resource-type-delete-availability-in-attachments')

require('~/initialization/envSetup')
const {
  config: { MONGODB_URL }
} = require('~/configs/config')

const collectionName = 'attachments'

const url = MONGODB_URL.slice(0, MONGODB_URL.lastIndexOf('/'))
const databaseName = MONGODB_URL.slice(MONGODB_URL.lastIndexOf('/') + 1)

describe('20241222143712-add-resource-type-delete-availability-in-attachments', () => {
  let client, database

  beforeAll(async () => {
    client = new MongoClient(url)
    await client.connect()
    database = client.db(databaseName)
    await database.collection(collectionName).deleteMany({})
  })

  afterAll(async () => {
    await database.collection(collectionName).deleteMany({})
    await client.close()
  })

  test('should remove availability field when it exists', async () => {
    const testId = new ObjectId()
    const testDocument = {
      _id: testId,
      availability: { status: 'open', date: null }
    }
    await database.collection(collectionName).insertOne(testDocument)

    const resultBefore = await database.collection(collectionName).findOne({ _id: testId })
    expect(resultBefore).toStrictEqual(testDocument)

    await up(database)

    const resultAfter = await database.collection(collectionName).findOne({ availability: { $exists: true } })
    expect(resultAfter).toBeNull()
  })

  test('should set resourceType when it is missing', async () => {
    const testId = new ObjectId()
    const testDocument = {
      _id: testId
    }
    await database.collection(collectionName).insertOne(testDocument)

    await up(database)

    const resultAfter = await database.collection(collectionName).findOne({ _id: testId })
    expect(resultAfter.resourceType).toBe('attachment')
  })

  test('should not add resourceType if already exists', async () => {
    const testId = new ObjectId()
    const testDocument = {
      _id: testId,
      resourceType: 'attachments'
    }
    await database.collection(collectionName).insertOne(testDocument)

    await up(database)

    const resultAfter = await database.collection(collectionName).findOne({ _id: testId })
    expect(resultAfter.resourceType).toBe('attachment')
  })

  test('should set availability field back when rolling back migration', async () => {
    const testId = new ObjectId()
    const testDocument = {
      _id: testId,
      resourceType: 'attachments'
    }
    await database.collection(collectionName).insertOne(testDocument)

    await down(database)

    const resultAfterDown = await database.collection(collectionName).findOne({ _id: testId })
    expect(resultAfterDown.availability).toEqual({
      status: 'open',
      date: null
    })
  })

  test('should remove resourceType field when rolling back migration', async () => {
    const testId = new ObjectId()
    const testDocument = {
      _id: testId,
      resourceType: 'attachments'
    }
    await database.collection(collectionName).insertOne(testDocument)

    await down(database)

    const resultAfterDownResourceType = await database.collection(collectionName).findOne({ _id: testId })
    expect(resultAfterDownResourceType.resourceType).toBeUndefined()
  })
})
