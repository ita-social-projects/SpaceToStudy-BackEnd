const { MongoClient } = require('mongodb')

const { up, down } = require('@root/migrations/20241106160527-add-fields-to-cooperations.js')

require('~/initialization/envSetup')
const {
  config: { MONGODB_URL }
} = require('~/configs/config')
const {
  testCategoryData,
  testSubjectData,
  collectionNames: { SUBJECTS, CATEGORIES, OFFERS, COOPERATIONS }
} = require('~/test/test-constants')

const url = MONGODB_URL.slice(0, MONGODB_URL.lastIndexOf('/'))
const databaseName = MONGODB_URL.slice(MONGODB_URL.lastIndexOf('/') + 1)

const testOfferData = {
  subject: 'subjectId',
  category: 'categoryId',
  description: 'Offer description',
  languages: ['English'],
  proficiencyLevel: ['Beginner']
}

const testCooperationData = {
  title: 'Cooperation title',
  proficiencyLevel: 'Beginner'
}

describe('20241106160527-add-fields-to-cooperations:', () => {
  let client, database, testSubjectId, testCategoryId, testCooperationId

  beforeAll(() => {
    client = new MongoClient(url)
    database = client.db(databaseName)
  })

  beforeEach(async () => {
    const testCategory = await database.collection(CATEGORIES).insertOne(testCategoryData)
    testCategoryId = testCategory.insertedId

    const testSubjectDataCopy = { ...testSubjectData, category: testCategory.insertedId }
    const testSubject = await database.collection(SUBJECTS).insertOne(testSubjectDataCopy)
    testSubjectId = testSubject.insertedId

    testOfferData.subject = testSubject.insertedId
    testOfferData.category = testCategory.insertedId
    const testOffer = await database.collection(OFFERS).insertOne(testOfferData)

    const testCooperation = await database
      .collection(COOPERATIONS)
      .insertOne({ ...testCooperationData, offer: testOffer.insertedId })
    testCooperationId = testCooperation.insertedId
  })

  afterEach(async () => {
    await database.dropDatabase()
  })

  afterAll(async () => {
    await client.close()
  })

  it('should migrate up', async () => {
    await up(database)

    const cooperationData = await database.collection(COOPERATIONS).findOne({ _id: testCooperationId })

    expect(cooperationData.category.toString()).toBe(testCategoryId.toString())
    expect(cooperationData.subject.toString()).toBe(testSubjectId.toString())
    expect(cooperationData.proficiencyLevel).toEqual(expect.arrayContaining(testOfferData.proficiencyLevel))
    expect(cooperationData.description).toBe(testOfferData.description)
    expect(cooperationData.languages).toEqual(expect.arrayContaining(testOfferData.languages))
  })

  it('should migrate down', async () => {
    await up(database)
    await down(database)

    const cooperationData = await database.collection(COOPERATIONS).findOne({ _id: testCooperationId })

    expect(cooperationData.category).toBeUndefined()
    expect(cooperationData.subject).toBeUndefined()
    expect(cooperationData.proficiencyLevel).toEqual(testOfferData.proficiencyLevel[0])
    expect(cooperationData.description).toBeUndefined()
    expect(cooperationData.languages).toBeUndefined()
  })
})
