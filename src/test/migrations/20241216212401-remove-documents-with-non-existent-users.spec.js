const { MongoClient, ObjectId } = require('mongodb')

const { up } = require('@root/migrations/20241216212401-remove-documents-with-non-existent-users')

require('~/initialization/envSetup')
const {
  config: { MONGODB_URL }
} = require('~/configs/config')

const collections = ['attachments', 'courses', 'lessons', 'notes', 'questions', 'quizzes', 'resourcescategories']
const existingUser = { _id: new ObjectId(), firstName: 'Test', lastName: 'User' }
const fakeUser = new ObjectId()

const url = MONGODB_URL.slice(0, MONGODB_URL.lastIndexOf('/'))
const databaseName = MONGODB_URL.slice(MONGODB_URL.lastIndexOf('/') + 1)

describe('20241216212401-remove-documents-with-non-existent-users', () => {
  let client, database

  beforeAll(() => {
    client = new MongoClient(url)
    database = client.db(databaseName)
  })

  afterAll(() => {
    client.close()
  })

  it('should remove documents with non-existing users from all collections', async () => {
    for (const collectionName of collections) {
      await database.collection(collectionName).insertOne({ author: fakeUser.toString() })
    }

    await up(database)

    for (const collectionName of collections) {
      const docsWithNonExistingUsers = await database
        .collection(collectionName)
        .find({ author: fakeUser.toString() })
        .toArray()
      expect(docsWithNonExistingUsers).toHaveLength(0)
    }
  })

  it('should not remove documents with existing users from all collections', async () => {
    await database.collection('users').insertOne(existingUser)

    for (const collectionName of collections) {
      await database.collection(collectionName).insertOne({ author: existingUser._id.toString() })
    }

    await up(database)

    for (const collectionName of collections) {
      const docsWithNonExistingUsers = await database
        .collection(collectionName)
        .find({ author: existingUser._id.toString() })
        .toArray()
      expect(docsWithNonExistingUsers).toHaveLength(1)
    }
  })
})
