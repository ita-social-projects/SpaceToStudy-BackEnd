const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const Question = require('~/models/question')
const ResourcesCategory = require('~/models/resourcesCategory')

describe('Question Model', () => {
  let server

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should include all required fields', async () => {
    const questions = await Question.find({})

    for (const question of questions) {
      expect(question).toHaveProperty('title')
      expect(question).toHaveProperty('text')
      expect(question).toHaveProperty('answers')
      expect(question).toHaveProperty('type')
      expect(question).toHaveProperty('author')
    }
  })

  it('should have valid fields data types', async () => {
    const questions = await Question.find({})

    for (const question of questions) {
      expect(typeof question.title).toBe('string')
      expect(typeof question.text).toBe('string')
      expect(Array.isArray(question.answers)).toBe(true)
      expect(typeof question.type).toBe('string')
      expect(typeof question.author).toBe('object')
    }
  })

  it('should validate length constraints of title and text fields', async () => {
    const questions = await Question.find({})

    for (const question of questions) {
      expect(question.title.length).toBeGreaterThanOrEqual(1)
      expect(question.title.length).toBeLessThanOrEqual(100)
      expect(question.text.length).toBeGreaterThanOrEqual(1)
      expect(question.text.length).toBeLessThanOrEqual(100)
    }
  })

  it('should not allow empty title and text fields', async () => {
    const questions = await Question.find({})

    for (const question of questions) {
      expect(question.title).not.toBeNull()
      expect(question.title.trim()).not.toEqual('')
      expect(question.text).not.toBeNull()
      expect(question.text.trim()).not.toEqual('')
    }
  })

  it('should validate answer structure', async () => {
    const questions = await Question.find({})

    for (const question of questions) {
      for (const answer of question.answers) {
        expect(typeof answer.text).toBe('string')
        expect(answer.text.length).toBeGreaterThanOrEqual(1)
        expect(answer.text.length).toBeLessThanOrEqual(150)
        expect(typeof answer.isCorrect).toBe('boolean')
      }
    }
  })

  it('should validate category reference', async () => {
    const questions = await Question.find({}).select({ category: true }).populate('category')

    for (const question of questions) {
      if (question.category) {
        expect(question.category).toBeInstanceOf(ResourcesCategory)
      }
    }
  })

  it('should validate resourceType field', async () => {
    const questions = await Question.find({})

    for (const question of questions) {
      expect(typeof question.resourceType).toBe('string')
    }
  })

  it('should fail validation for empty required fields when creating a question', async () => {
    const schemaPaths = Question.schema.paths

    expect(schemaPaths.title.options.required).toBeTruthy()
    expect(schemaPaths.text.options.required).toBeTruthy()
    expect(schemaPaths.type.options.required).toBeTruthy()
    expect(schemaPaths.author.options.required).toBeTruthy()
  })
})
