const mongoose = require('mongoose')
const Lessons = require('~/models/lesson')
const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const migration = require('@root/migrations/20241223082318-delete-avaibility-fields-from-lessons')

describe('20241216212401-remove-availability-field', () => {
  let server

  beforeAll(async () => {
    ;({ server } = await serverInit())
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  const insertLessons = async (data) => {
    await Lessons.insertMany(data)
  }

  const getLessons = async () => {
    return Lessons.find({}).lean()
  }

  it('should remove the "availability" field from all documents', async () => {
    await insertLessons([
      {
        title: 'Lesson 1',
        availability: 'available',
        otherField: 'value1',
        content: '<p>'.concat('Content 1 '.repeat(10), '</p>'),
        description: 'Description 1',
        author: new mongoose.Types.ObjectId()
      },
      {
        title: 'Lesson 2',
        availability: 'unavailable',
        otherField: 'value2',
        content: '<p>'.concat('Content 2 '.repeat(10), '</p>'),
        description: 'Description 2',
        author: new mongoose.Types.ObjectId()
      }
    ])

    await migration.up(mongoose.connection.db)
    const updatedDocs = await getLessons()

    expect(updatedDocs).toHaveLength(2)
    updatedDocs.forEach((doc) => {
      expect(doc).not.toHaveProperty('availability')
    })
  })

  it('should handle the down migration without throwing errors', async () => {
    await insertLessons([
      {
        title: 'Lesson 5',
        availability: 'available',
        otherField: 'value5',
        content: '<p>'.concat('Content 5 '.repeat(10), '</p>'),
        description: 'Description 5',
        author: new mongoose.Types.ObjectId()
      }
    ])

    await expect(migration.down(mongoose.connection.db)).resolves.not.toThrow()
  })
})
