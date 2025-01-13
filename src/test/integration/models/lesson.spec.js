const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const Lesson = require('~/models/lesson')

describe('Lesson Model', () => {
  let server

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should validate the author field references a real user', async () => {
    const lessons = await Lesson.find({}).populate('author')

    for (const lesson of lessons) {
      expect(lesson.author).toBeDefined()
      expect(lesson.author).not.toBeNull()
      expect(lesson.author).toHaveProperty('firstName')
    }
  })

  it('should validate the category field references a real category', async () => {
    const lessons = await Lesson.find({}).populate('category')

    for (const lesson of lessons) {
      if (lesson.category) {
        expect(lesson.category).toBeDefined()
        expect(lesson.category).toHaveProperty('name')
      }
    }
  })

  it('should validate the resourceType field contains a valid value', async () => {
    const lessons = await Lesson.find({})
    for (const lesson of lessons) {
      expect(Lesson.schema.path('resourceType').enumValues).toContain(lesson.resourceType)
    }
  })

  it('should validate timestamps exist and are correct', async () => {
    const lessons = await Lesson.find({})
    for (const lesson of lessons) {
      expect(lesson).toHaveProperty('createdAt')
      expect(lesson).toHaveProperty('updatedAt')
      expect(new Date(lesson.createdAt).getTime()).toBeLessThanOrEqual(Date.now())
      expect(new Date(lesson.updatedAt).getTime()).toBeLessThanOrEqual(Date.now())
    }
  })

  it('should validate the title field is valid', async () => {
    const lessons = await Lesson.find({})
    for (const lesson of lessons) {
      expect(lesson.title).toBeDefined()
      expect(typeof lesson.title).toBe('string')
      expect(lesson.title.length).toBeGreaterThanOrEqual(1)
      expect(lesson.title.length).toBeLessThanOrEqual(100)
    }
  })

  it('should validate the description field is valid', async () => {
    const lessons = await Lesson.find({})
    for (const lesson of lessons) {
      expect(lesson.description).toBeDefined()
      expect(typeof lesson.description).toBe('string')
      expect(lesson.description.length).toBeGreaterThanOrEqual(1)
      expect(lesson.description.length).toBeLessThanOrEqual(1000)
    }
  })

  it('should validate the content field is valid', async () => {
    const lessons = await Lesson.find({})
    for (const lesson of lessons) {
      expect(lesson.content).toBeDefined()
      expect(typeof lesson.content).toBe('string')
      expect(lesson.content.length).toBeGreaterThanOrEqual(50)
    }
  })

  it('should validate the attachments field references real attachments', async () => {
    const lessons = await Lesson.find({}).populate('attachments')
    for (const lesson of lessons) {
      if (lesson.attachments.length > 0) {
        lesson.attachments.forEach((attachment) => {
          expect(attachment).not.toBeNull()
          expect(attachment).toHaveProperty('fileName')
        })
      }
    }
  })

  it('should validate the isDuplicate field is a boolean', async () => {
    const lessons = await Lesson.find({})
    for (const lesson of lessons) {
      if (lesson.isDuplicate !== undefined) {
        expect(typeof lesson.isDuplicate).toBe('boolean')
      }
    }
  })
})
