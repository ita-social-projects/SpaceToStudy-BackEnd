const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const {
  enums: { QUIZ_VIEW_ENUM, RESOURCES_TYPES_ENUM }
} = require('~/consts/validation')

const Quiz = require('~/models/quiz')

const quizFields = [
  'title',
  'description',
  'items',
  'author',
  'category',
  'resourceType',
  'isDuplicate',
  'settings',
  'createdAt',
  'updatedAt'
]

describe('Quiz model', () => {
  let server, quizzes

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server

    quizzes = await Quiz.find({})
  })

  afterAll(async () => await stopServer(server))

  it('should have all the required fields', () => {
    for (const quiz of quizzes) {
      quizFields.forEach((field) => {
        expect(quiz).toHaveProperty(field)
      })
    }
  })

  it('should have a valid resourceType field', async () => {
    for (const quiz of quizzes) {
      expect(RESOURCES_TYPES_ENUM).toContain(quiz.resourceType)
    }
  })

  it('should validate the category field references a real category', async () => {
    const quizzesWithRealCategories = await Quiz.find({}).populate('category')

    for (const quiz of quizzesWithRealCategories) {
      if (quiz.category) {
        expect(quiz.category).toHaveProperty('name')
      }
    }
  })

  it('should validate the isDuplicate field is a boolean', async () => {
    for (const quiz of quizzes) {
      if (quiz.isDuplicate) {
        expect(typeof quiz.isDuplicate).toBe('boolean')
      }
    }
  })

  it('should have a valid items field', async () => {
    for (const quiz of quizzes) {
      expect(Array.isArray(quiz.items)).toBe(true)
    }
  })

  it('should validate the title field is valid', async () => {
    for (const quiz of quizzes) {
      expect(quiz.title).toBeDefined()
      expect(typeof quiz.title).toBe('string')
      expect(quiz.title.length).toBeGreaterThanOrEqual(1)
      expect(quiz.title.length).toBeLessThanOrEqual(100)
    }
  })
  it('should validate the description field is valid', async () => {
    for (const quiz of quizzes) {
      expect(quiz.description).toBeDefined()
      expect(typeof quiz.description).toBe('string')
      expect(quiz.description.length).toBeLessThanOrEqual(150)
    }
  })

  it('should have non-null required fields', () => {
    for (const quiz of quizzes) {
      expect(quiz.title).not.toBeNull()
      expect(quiz.items).not.toBeNull()
      expect(quiz.author).not.toBeNull()
    }
  })

  it('should validate timestamps exist and are correct', async () => {
    for (const quiz of quizzes) {
      expect(quiz).toHaveProperty('createdAt')
      expect(quiz).toHaveProperty('updatedAt')
      expect(quiz.createdAt).toBeInstanceOf(Date)
      expect(quiz.updatedAt).toBeInstanceOf(Date)
    }
  })

  it('should have valid settings', () => {
    for (const quiz of quizzes) {
      expect(QUIZ_VIEW_ENUM).toContain(quiz.settings.view)
      expect(typeof quiz.settings.shuffle).toBe('boolean')
      expect(typeof quiz.settings.pointValues).toBe('boolean')
      expect(typeof quiz.settings.scoredResponses).toBe('boolean')
      expect(typeof quiz.settings.correctAnswers).toBe('boolean')
    }
  })

  it('should have title field within valid length constraints', () => {
    for (const quiz of quizzes) {
      expect(quiz.title.length).toBeGreaterThanOrEqual(1)
      expect(quiz.title.length).toBeLessThanOrEqual(100)
    }
  })

  it('should have description field within valid length constraints', () => {
    for (const quiz of quizzes) {
      if (quiz.description) {
        expect(quiz.description.length).toBeLessThanOrEqual(150)
      }
    }
  })
})
