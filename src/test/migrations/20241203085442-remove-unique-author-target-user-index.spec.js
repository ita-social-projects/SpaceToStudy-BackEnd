const { MongoClient } = require('mongodb')

const { up, down } = require('@root/migrations/20241203085442-remove-unique-author-target-user-index')

require('~/initialization/envSetup')
const {
  config: { MONGODB_URL }
} = require('~/configs/config')

const collectionName = 'reviews'
const indexName = 'author_1_targetUserId_1'

const url = MONGODB_URL.slice(0, MONGODB_URL.lastIndexOf('/'))
const databaseName = MONGODB_URL.slice(MONGODB_URL.lastIndexOf('/') + 1)

describe('20241203085442-remove-unique-author-target-user-index', () => {
  let client, database

  beforeAll(() => {
    client = new MongoClient(url)
    database = client.db(databaseName)
  })

  afterAll(() => {
    client.close()
  })

  test('should create the unique index on migrate down', async () => {
    await down(database)
    const indexes = await database.collection(collectionName).indexes()
    const indexNames = indexes.map((index) => index.name)
    expect(indexNames).toContain(indexName)
  })

  test('should remove the unique index on migrate up', async () => {
    await up(database)
    const indexes = await database.collection(collectionName).indexes()
    const indexNames = indexes.map((index) => index.name)
    expect(indexNames).not.toContain(indexName)
  })
})
