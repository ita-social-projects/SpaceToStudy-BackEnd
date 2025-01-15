const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const FinishedLesson = require('~/models/finishedLesson')
const Lesson = require('~/models/lesson')

describe('FinishedLesson model', () => {
  let server

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should include all required fields', async () => {
    const finishedLessons = await FinishedLesson.find({})

    for (const finishedLesson of finishedLessons) {
      expect(finishedLesson).toHaveProperty('lesson')
      expect(finishedLesson).toHaveProperty('createdAt')
      expect(finishedLesson).toHaveProperty('updatedAt')
    }
  })

  it('should have valid fields data types', async () => {
    const finishedLessons = await FinishedLesson.find({})

    for (const finishedLesson of finishedLessons) {
      expect(typeof finishedLesson.lesson).toBe('object')
      expect(finishedLesson.createdAt).toBeInstanceOf(Date)
      expect(finishedLesson.updatedAt).toBeInstanceOf(Date)
    }
  })

  it('should have valid lesson field references', async () => {
    const finishedLessons = await FinishedLesson.find({})

    for (const finishedLesson of finishedLessons) {
      expect(finishedLesson.lesson).not.toBeNull()

      const lesson = await Lesson.findById(finishedLesson.lesson)
      expect(lesson).not.toBeNull()
      expect(lesson).toBeInstanceOf(Lesson)
    }
  })
})
