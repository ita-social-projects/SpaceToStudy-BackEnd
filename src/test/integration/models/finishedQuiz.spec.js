const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const FinishedQuiz = require('~/models/finishedQuiz')
const Quiz = require('~/models/quiz')
const {
  FIELD_CANNOT_BE_EMPTY,
  FIELD_CANNOT_BE_SHORTER,
  FIELD_CANNOT_BE_LONGER,
  VALUE_MUST_BE_ABOVE,
  VALUE_MUST_BE_BELOW
} = require('~/consts/errors')

describe('Course model', () => {
  let server

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should include all required fields', async () => {
    const finishedQuizzes = await FinishedQuiz.find({})

    for (const finishedQuiz of finishedQuizzes) {
      expect(finishedQuiz).toHaveProperty('quiz')
      expect(finishedQuiz).toHaveProperty('grade')
      expect(finishedQuiz).toHaveProperty('results')
      expect(finishedQuiz).toHaveProperty('createdAt')
      expect(finishedQuiz).toHaveProperty('updatedAt')
    }
  })

  it('should have valid fields data types', async () => {
    const finishedQuizzes = await FinishedQuiz.find({})

    for (const finishedQuiz of finishedQuizzes) {
      expect(typeof finishedQuiz.quiz).toBe('object')
      expect(typeof finishedQuiz.grade).toBe('number')
      expect(Array.isArray(finishedQuiz.results)).toBe(true)
      expect(finishedQuiz.createdAt).toBeInstanceOf(Date)
      expect(finishedQuiz.updatedAt).toBeInstanceOf(Date)

      for (const result of finishedQuiz.results) {
        expect(typeof result.question).toBe('string')
        expect(Array.isArray(result.answers)).toBe(true)

        for (const answer of result.answers) {
          expect(typeof answer.text).toBe('string')
          expect(typeof answer.isCorrect).toBe('boolean')
          expect(typeof answer.isChosen).toBe('boolean')
        }
      }
    }
  })

  it('should have valid quiz field references', async () => {
    const finishedQuizzes = await FinishedQuiz.find({}).populate('quiz')

    for (const finishedQuiz of finishedQuizzes) {
      if (finishedQuiz.quiz) {
        expect(finishedQuiz.quiz).not.toBeNull()
        expect(finishedQuiz.quiz).toBeInstanceOf(Quiz)
      }
    }
  })

  it('should not allow empty quiz field', async () => {
    const finishedQuizzes = await FinishedQuiz.find({})

    for (const finishedQuiz of finishedQuizzes) {
      expect(finishedQuiz.quiz).not.toBeNull()
    }
  })

  it('should return FIELD_CANNOT_BE_EMPTY error for missing required data in quiz field', async () => {
    const emptyField = await FinishedQuiz.find({ quiz: null })

    for (const finishedQuiz of emptyField) {
      expect(finishedQuiz.validateSync().errors.quiz.message).toBe(FIELD_CANNOT_BE_EMPTY('quiz'))
    }
  })

  it('should not allow empty grade field', async () => {
    const finishedQuizzes = await FinishedQuiz.find({})

    for (const finishedQuiz of finishedQuizzes) {
      expect(finishedQuiz.grade).not.toBeNull()
    }
  })

  it('should return FIELD_CANNOT_BE_EMPTY error for missing required data in grade field', async () => {
    const emptyField = await FinishedQuiz.find({ grade: null })

    for (const finishedQuiz of emptyField) {
      expect(finishedQuiz.validateSync().errors.grade.message).toBe(FIELD_CANNOT_BE_EMPTY('grade'))
    }
  })

  it('should validate that grade is within the allowed range', async () => {
    const finishedQuizzes = await FinishedQuiz.find({})

    for (const finishedQuiz of finishedQuizzes) {
      if (finishedQuiz.grade !== undefined && finishedQuiz.grade !== null) {
        expect(finishedQuiz.grade).toBeGreaterThanOrEqual(0)
        expect(finishedQuiz.grade).toBeLessThanOrEqual(100)
      }
    }
  })

  it('should return VALUE_MUST_BE_ABOVE and VALUE_MUST_BE_BELOW for invalid grade range in existing data', async () => {
    const belowRange = await FinishedQuiz.find({ grade: { $lt: 0 } })
    const aboveRange = await FinishedQuiz.find({ grade: { $gt: 100 } })

    for (const finishedQuiz of belowRange) {
      expect(finishedQuiz.validateSync().errors.grade.message).toBe(VALUE_MUST_BE_ABOVE('grade', 0))
    }

    for (const finishedQuiz of aboveRange) {
      expect(finishedQuiz.validateSync().errors.grade.message).toBe(VALUE_MUST_BE_BELOW('grade', 100))
    }
  })

  it('should return FIELD_CANNOT_BE_EMPTY for missing question field in existing data', async () => {
    const emptyAnswers = await FinishedQuiz.find({
      'results.question': { $exists: true, $regex: '^.{0}$' }
    })

    for (const finishedQuiz of emptyAnswers) {
      const error = finishedQuiz.validateSync().errors['results.0.question']
      expect(error.message).toBe(FIELD_CANNOT_BE_EMPTY('question'))
    }
  })

  it('should return FIELD_CANNOT_BE_SHORTER and FIELD_CANNOT_BE_LONGER for invalid question length in existing data', async () => {
    const tooShortQuestions = await FinishedQuiz.find({
      'results.question': { $exists: true, $regex: '^.{0}$' }
    })
    const tooLongQuestions = await FinishedQuiz.find({
      'results.question': { $exists: true, $regex: '^.{151,}$' }
    })

    for (const finishedQuiz of tooShortQuestions) {
      const error = finishedQuiz.validateSync().errors['results.0.question']
      expect(error.message).toBe(FIELD_CANNOT_BE_SHORTER('question', 1))
    }

    for (const finishedQuiz of tooLongQuestions) {
      const error = finishedQuiz.validateSync().errors['results.0.question']
      expect(error.message).toBe(FIELD_CANNOT_BE_LONGER('question', 150))
    }
  })

  it('should return FIELD_CANNOT_BE_EMPTY for missing answer text in existing data', async () => {
    const emptyAnswers = await FinishedQuiz.find({
      'results.answers.text': { $exists: true, $regex: '^.{0}$' }
    })

    for (const finishedQuiz of emptyAnswers) {
      const error = finishedQuiz.validateSync().errors['results.0.answers.0.text']
      expect(error.message).toBe(FIELD_CANNOT_BE_EMPTY('answer'))
    }
  })

  it('should return FIELD_CANNOT_BE_SHORTER and FIELD_CANNOT_BE_LONGER for invalid answers text length in existing data', async () => {
    const tooShortAnswers = await FinishedQuiz.find({
      'results.answers.text': { $exists: true, $regex: '^.{0}$' }
    })
    const tooLongAnswers = await FinishedQuiz.find({
      'results.answers.text': { $exists: true, $regex: '^.{151,}$' }
    })

    for (const finishedQuiz of tooShortAnswers) {
      const error = finishedQuiz.validateSync().errors['results.0.answers.0.text']
      expect(error.message).toBe(FIELD_CANNOT_BE_SHORTER('answer', 1))
    }

    for (const finishedQuiz of tooLongAnswers) {
      const error = finishedQuiz.validateSync().errors['results.0.answers.0.text']
      expect(error.message).toBe(FIELD_CANNOT_BE_LONGER('answer', 150))
    }
  })
})
