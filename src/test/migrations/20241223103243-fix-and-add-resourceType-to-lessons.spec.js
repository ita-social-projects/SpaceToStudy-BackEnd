const mongoose = require('mongoose')
const Lessons = require('~/models/lesson')
const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const migration = require('@root/migrations/20241223103243-fix-and-add-resourceType-to-lessons')

describe('20241223082318-update-resource-type-in-lessons', () => {
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

  const insertLessonsWithoutValidation = async (data) => {
    const lessonsCollection = mongoose.connection.db.collection('lessons')
    await lessonsCollection.insertMany(data)
  }

  const getLessons = async () => {
    return Lessons.find({}).lean()
  }

  const lessonBase = {
    content: '<p>'.concat('Content 1 '.repeat(10), '</p>'),
    description: 'This is a test description.',
    author: new mongoose.Types.ObjectId(),
    title: 'Default Title'
  }

  it('should update resourceType to "lesson" for documents with "resourceType: lessons" or missing field (up)', async () => {
    await insertLessonsWithoutValidation([
      {
        ...lessonBase,
        title: 'Lesson 1',
        resourceType: 'lessons'
      },
      {
        ...lessonBase,
        title: 'Lesson 2'
      }
    ])

    await migration.up(mongoose.connection.db)

    const updatedDocs = await getLessons()

    expect(updatedDocs).toHaveLength(2)

    updatedDocs.forEach((doc) => {
      if (doc.title === 'Lesson 1') {
        expect(doc.resourceType).toBe('lesson')
      } else if (doc.title === 'Lesson 2') {
        expect(doc.resourceType).toBe('lesson')
      }
    })
  })

  it('should revert resourceType to "lessons" for documents with "resourceType: lesson" (down)', async () => {
    await insertLessonsWithoutValidation([
      {
        ...lessonBase,
        title: 'Lesson 1',
        resourceType: 'lesson'
      },
      {
        ...lessonBase,
        title: 'Lesson 2',
        resourceType: 'quiz'
      }
    ])

    await migration.down(mongoose.connection.db)

    const revertedDocs = await getLessons()

    expect(revertedDocs).toHaveLength(2)

    revertedDocs.forEach((doc) => {
      if (doc.title === 'Lesson 1') {
        expect(doc.resourceType).toBe('lessons')
      } else if (doc.title === 'Lesson 2') {
        expect(doc.resourceType).toBe('quiz')
      }
    })
  })
})
