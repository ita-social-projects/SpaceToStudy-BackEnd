const { MongoClient, ObjectId } = require('mongodb')
const {
  up,
  transformSection
} = require('@root/migrations/20241220213859-delete-old-fields-in-cooperatives-and-add-new-ones')

require('~/initialization/envSetup')
const {
  config: { MONGODB_URL }
} = require('~/configs/config')

const cooperationCollection = 'cooperation'
const usersColection = 'users'

const url = MONGODB_URL.slice(0, MONGODB_URL.lastIndexOf('/'))
const databaseName = MONGODB_URL.slice(MONGODB_URL.lastIndexOf('/') + 1)

describe('20241220213859-delete-old-fields-in-cooperatives-and-add-new-ones', () => {
  let client, database
  const validCooperation = {
    _id: new ObjectId('67635665d8fe9dc8a4ddeb4d'),
    offer: new ObjectId('67635517d8fe9dc8a4ddeafe'),
    initiator: new ObjectId('6760c0187d4fdb8ce2ad1b0c'),
    initiatorRole: 'tutor',
    receiver: new ObjectId('6735ff2cc8f5e44cc3de002d'),
    receiverRole: 'student',
    title: 'differential equation',
    proficiencyLevel: 'Intermediate',
    price: 500,
    status: 'active',
    needAction: 'student',
    availableQuizzes: [],
    finishedQuizzes: [],
    sections: [
      {
        title: 'Test',
        description: 'TEST',
        resources: [
          {
            resource: new ObjectId('67635241d8fe9dc8a4ddea63'),
            resourceType: 'attachment',
            availability: {
              status: 'open',
              date: null
            },
            completionStatus: 'active'
          }
        ],
        _id: new ObjectId('6763574cd8fe9dc8a4ddebf2')
      }
    ],
    createdAt: new Date('2024-12-18T23:10:29.923Z'),
    updatedAt: new Date('2024-12-18T23:14:20.063Z')
  }
  const users = [{ _id: new ObjectId('6760c0187d4fdb8ce2ad1b0c') }, { _id: new ObjectId('6735ff2cc8f5e44cc3de002d') }]
  const section = {
    title: 'Test Title',
    description: 'Test Description',
    _id: new ObjectId('6763574cd8fe9dc8a4ddebf2'),
    activities: [
      {
        resource: {
          _id: new ObjectId('67635241d8fe9dc8a4ddea63'),
          availability: { status: 'active', date: null }
        },
        resourceType: 'attachment',
        completionStatus: 'completed'
      }
    ]
  }

  const sectionWithMissingFields = {
    title: 'Incomplete Section',
    description: 'Missing fields'
  }

  beforeAll(async () => {
    client = new MongoClient(url)
    database = client.db(databaseName)
    await database.collection(cooperationCollection).deleteMany({})

    await database.collection(usersColection).insertMany(users)
    await database.collection(cooperationCollection).insertOne(validCooperation)
    await client.connect()
  })

  afterAll(async () => {
    await database.collection(usersColection).deleteMany({})
    await database.collection(cooperationCollection).deleteMany({})
    await client.close()
  })

  test('should remove cooperations with non-existent initiator or receiver', async () => {
    const initialCooperationsCount = await database.collection(cooperationCollection).countDocuments()

    const invalidCooperation = {
      initiator: ObjectId(),
      receiver: ObjectId(),
      proficiencyLevel: ['Intermediate', 'Advanced'],
      sections: []
    }
    await database.collection(cooperationCollection).insertOne(invalidCooperation)

    await up(database, client)

    const finalCooperationsCount = await database.collection(cooperationCollection).countDocuments()
    expect(finalCooperationsCount).toBe(initialCooperationsCount)
  })

  test('should create title and sections fields for documents without them', async () => {
    const cooperationWithoutFields = {
      initiator: validCooperation.initiator,
      receiver: validCooperation.receiver,
      proficiencyLevel: 'Intermediate',
      additionalInfo: '11112222'
    }
    await database.collection(cooperationCollection).insertOne(cooperationWithoutFields)

    await up(database, client)

    const updatedCooperation = await database.collection(cooperationCollection).findOne({ additionalInfo: '11112222' })
    expect(updatedCooperation.title).toBeDefined()
    expect(updatedCooperation.sections).toBeDefined()
  })

  test('should remove category, subject, languages, and description fields', async () => {
    const cooperationWithOldFields = {
      initiator: validCooperation.initiator,
      receiver: validCooperation.receiver,
      proficiencyLevel: ['Intermediate', 'Advanced'],
      additionalInfo: 'some description2',
      sections: []
    }
    await database.collection(cooperationCollection).insertOne(cooperationWithOldFields)

    await up(database, client)

    const updatedCooperation = await database
      .collection(cooperationCollection)
      .findOne({ additionalInfo: 'some description2' })
    expect(updatedCooperation.proficiencyLevel).toBe('Advanced')
  })
  test('should convert the field proficiencyLevel from an array to a string', async () => {
    const cooperationWithOldFields = {
      initiator: validCooperation.initiator,
      receiver: validCooperation.receiver,
      proficiencyLevel: 'Intermediate',
      additionalInfo: 'some description1',
      sections: []
    }
    await database.collection(cooperationCollection).insertOne(cooperationWithOldFields)

    await up(database, client)

    const updatedCooperation = await database
      .collection(cooperationCollection)
      .findOne({ additionalInfo: 'some description1' })
    expect(updatedCooperation.category).toBeUndefined()
  })
  test('should add additionalInfo field to all documents', async () => {
    const cooperationWithoutInfo = {
      initiator: validCooperation.initiator,
      receiver: validCooperation.receiver,
      proficiencyLevel: 'Intermediate',
      description: 'testtesttesttesttesttest',
      sections: []
    }
    await database.collection(cooperationCollection).insertOne(cooperationWithoutInfo)

    await up(database, client)

    const updatedCooperation = await database
      .collection(cooperationCollection)
      .findOne({ additionalInfo: 'testtesttesttesttesttest' })
    expect(updatedCooperation.additionalInfo).toBeDefined()
  })

  test('should not affect correct documents', async () => {
    const correctCooperation = {
      initiator: validCooperation.initiator,
      receiver: validCooperation.receiver,
      proficiencyLevel: validCooperation.proficiencyLevel,
      sections: [{ title: 'Section 1', description: 'Some description', resources: [] }],
      additionalInfo: 'Some description',
      title: 'Valid cooperation'
    }
    await database.collection(cooperationCollection).insertOne(correctCooperation)

    await up(database, client)

    const updatedCooperation = await database.collection(cooperationCollection).findOne({ title: 'Valid cooperation' })

    expect(updatedCooperation.title).toBe('Valid cooperation')
    expect(updatedCooperation.sections.length).toBe(1)
    expect(updatedCooperation.additionalInfo).toBeDefined()
  })

  test('migration should set sections to an empty array if missing', async () => {
    const cooperationWithoutSections = {
      initiator: validCooperation.initiator,
      receiver: validCooperation.receiver,
      proficiencyLevel: 'Intermediate'
    }

    await database.collection(cooperationCollection).insertOne(cooperationWithoutSections)
    await up(database, client)

    const updatedCooperation = await database
      .collection(cooperationCollection)
      .findOne({ _id: cooperationWithoutSections._id })
    expect(updatedCooperation.sections).toEqual([])
  })

  test('transformSection should return an empty object for sections with missing required fields', () => {
    const transformed = transformSection(sectionWithMissingFields)
    expect(transformed).toEqual({})
  })

  test('transformSection should set default completionStatus to "active" if not provided', () => {
    const sectionWithMissingStatus = {
      ...section,
      activities: [
        {
          resource: { _id: new ObjectId('67635241d8fe9dc8a4ddea63') },
          resourceType: 'attachment'
        }
      ]
    }
    const transformed = transformSection(sectionWithMissingStatus)

    expect(transformed.resources[0].completionStatus).toBe('active')
  })

  test('should set resources to an empty array if section activities are missing', async () => {
    const coperationIdWithInvalidSection = new ObjectId()
    const cooperationWithInvalidSection = {
      _id: coperationIdWithInvalidSection,
      initiator: validCooperation.initiator,
      receiver: validCooperation.receiver,
      proficiencyLevel: 'Intermediate',
      sections: [
        {
          title: 'Invalid Section',
          description: 'Section with missing activities',
          _id: new ObjectId()
        }
      ]
    }

    await database.collection(cooperationCollection).insertOne(cooperationWithInvalidSection)

    await up(database, client)

    const updatedCooperation = await database.collection(cooperationCollection).findOne({
      _id: coperationIdWithInvalidSection
    })

    expect(updatedCooperation.sections).toEqual([])
  })
})
