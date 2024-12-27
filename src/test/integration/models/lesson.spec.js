const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const Lesson = require('~/models/Lesson')
const User = require('~/models/User')
const ResourcesCategory = require('~/models/ResourcesCategory')

describe('Lesson Model - Production Data Validation', () => {
  let server

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('Should validate the author field references a real user', async () => {
    const lessons = await Lesson.find({}).populate('author')
    for (const lesson of lessons) {
      expect(lesson.author).toBeDefined()
      const user = await User.findById(lesson.author)
      expect(user).not.toBeNull()
      expect(user).toHaveProperty('firstName')
      expect(user).toHaveProperty('email')
    }
  })

  it('Should validate the category field references a real category', async () => {
    const lessons = await Lesson.find({}).populate('category')
    for (const lesson of lessons) {
      if (lesson.category) {
        const category = await ResourcesCategory.findById(lesson.category._id)
        expect(category).not.toBeNull()
        expect(category).toHaveProperty('name')
      }
    }
  })

  it('Should validate the resourceType field contains a valid value', async () => {
    const lessons = await Lesson.find({})
    for (const lesson of lessons) {
      expect(Lesson.schema.path('resourceType').enumValues).toContain(lesson.resourceType)
    }
  })

  it('Should validate timestamps exist and are correct', async () => {
    const lessons = await Lesson.find({})
    for (const lesson of lessons) {
      expect(lesson).toHaveProperty('createdAt')
      expect(lesson).toHaveProperty('updatedAt')
      expect(new Date(lesson.createdAt).getTime()).toBeLessThanOrEqual(Date.now())
      expect(new Date(lesson.updatedAt).getTime()).toBeLessThanOrEqual(Date.now())
    }
  })

  it('Should validate the title field is valid', async () => {
    const lessons = await Lesson.find({})
    for (const lesson of lessons) {
      expect(lesson.title).toBeDefined()
      expect(typeof lesson.title).toBe('string')
      expect(lesson.title.length).toBeGreaterThanOrEqual(1)
      expect(lesson.title.length).toBeLessThanOrEqual(100)
    }
  })

  it('Should validate the description field is valid', async () => {
    const lessons = await Lesson.find({})
    for (const lesson of lessons) {
      expect(lesson.description).toBeDefined()
      expect(typeof lesson.description).toBe('string')
      expect(lesson.description.length).toBeGreaterThanOrEqual(1)
      expect(lesson.description.length).toBeLessThanOrEqual(1000)
    }
  })

  it('Should validate the content field is valid', async () => {
    const lessons = await Lesson.find({})
    for (const lesson of lessons) {
      expect(lesson.content).toBeDefined()
      expect(typeof lesson.content).toBe('string')
      expect(lesson.content.length).toBeGreaterThanOrEqual(50)
    }
  })

  it('Should validate the attachments field references real attachments', async () => {
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

  it('Should validate the isDuplicate field is a boolean', async () => {
    const lessons = await Lesson.find({})
    for (const lesson of lessons) {
      if (lesson.isDuplicate !== undefined) {
        expect(typeof lesson.isDuplicate).toBe('boolean')
      }
    }
  })
})
