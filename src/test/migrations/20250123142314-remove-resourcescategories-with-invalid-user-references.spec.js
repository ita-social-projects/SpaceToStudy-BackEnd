const mongoose = require('mongoose')
const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const ResourcesCategories = require('~/models/resourcesCategory')

const migration = require('@root/migrations/20250123142314-remove-resourcescategories-with-invalid-user-references')

const resourcesCategories = {
  name: 'Music'
}

const authorData = {
  email: 'john_doe@example.com',
  password: 'password'
}

const insertTestData = async () => {
  const { insertedId: authorId } = await mongoose.connection.db.collection('users').insertOne(authorData)

  return authorId
}

describe('20250123142314-remove-resourcescategories-with-invalid-user-references', () => {
  let server

  beforeAll(async () => ({ server } = await serverInit()))

  afterEach(async () => await serverCleanup())

  afterAll(async () => {
    await stopServer(server)
  })

  test('should remove resourcesCategories with invalid author references', async () => {
    const authorId = await insertTestData()

    const validResourcesCategories = {
      ...resourcesCategories,
      author: authorId
    }

    const invalidResourcesCategories = {
      ...resourcesCategories,
      author: '5f5f5f5f5f5f5f5f5f5f5f5f'
    }

    await ResourcesCategories.create(validResourcesCategories)
    await ResourcesCategories.create(invalidResourcesCategories)

    await migration.up(mongoose.connection.db)

    const invalidResourcesCategoriesAfterMigration = await ResourcesCategories.find({
      author: '5f5f5f5f5f5f5f5f5f5f5f5f'
    })
    const validResourcesCategoriesAfterMigration = await ResourcesCategories.find({})

    expect(invalidResourcesCategoriesAfterMigration).toHaveLength(0)
    expect(validResourcesCategoriesAfterMigration).toHaveLength(1)
  })
})
