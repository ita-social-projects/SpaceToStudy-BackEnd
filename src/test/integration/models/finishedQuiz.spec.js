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
    const attempts = await FinishedQuiz.find({})

    for (const attempt of attempts) {
      expect(attempt).toHaveProperty('quiz')
      expect(attempt).toHaveProperty('grade')
      expect(attempt).toHaveProperty('results')
      expect(attempt).toHaveProperty('createdAt')
      expect(attempt).toHaveProperty('updatedAt')
    }
  })

  it('should have valid fields data types', async () => {
    const attempts = await FinishedQuiz.find({})

    for (const attempt of attempts) {
      expect(typeof attempt.quiz).toBe('object')
      expect(typeof attempt.grade).toBe('number')
      expect(Array.isArray(attempt.results)).toBe(true)
      expect(attempt.createdAt).toBeInstanceOf(Date)
      expect(attempt.updatedAt).toBeInstanceOf(Date)

      for (const result of attempt.results) {
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
    const attempts = await FinishedQuiz.find({}).populate('quiz')

    for (const attempt of attempts) {
      if (attempt.quiz) {
        expect(attempt.quiz).not.toBeNull()
        expect(attempt.quiz).toBeInstanceOf(Quiz)
      }
    }
  })

  it('should not allow empty quiz field', async () => {
    const attempts = await FinishedQuiz.find({})

    for (const attempt of attempts) {
      expect(attempt.quiz).not.toBeNull()
    }
  })

  it('should return FIELD_CANNOT_BE_EMPTY error for missing required data in quiz field', async () => {
    const emptyField = await FinishedQuiz.find({ quiz: null })

    for (const attempt of emptyField) {
      expect(attempt.validateSync().errors.quiz.message).toBe(FIELD_CANNOT_BE_EMPTY('quiz'))
    }
  })

  it('should not allow empty grade field', async () => {
    const attempts = await FinishedQuiz.find({})

    for (const attempt of attempts) {
      expect(attempt.grade).not.toBeNull()
    }
  })

  it('should return FIELD_CANNOT_BE_EMPTY error for missing required data in grade field', async () => {
    const emptyField = await FinishedQuiz.find({ grade: null })

    for (const attempt of emptyField) {
      expect(attempt.validateSync().errors.grade.message).toBe(FIELD_CANNOT_BE_EMPTY('grade'))
    }
  })

  it('should validate that grade is within the allowed range', async () => {
    const attempts = await FinishedQuiz.find({})

    for (const attempt of attempts) {
      if (attempt.grade !== undefined && attempt.grade !== null) {
        expect(attempt.grade).toBeGreaterThanOrEqual(0)
        expect(attempt.grade).toBeLessThanOrEqual(100)
      }
    }
  })

  it('should return VALUE_MUST_BE_ABOVE and VALUE_MUST_BE_BELOW for invalid grade range in existing data', async () => {
    const belowRange = await FinishedQuiz.find({ grade: { $lt: 0 } })
    const aboveRange = await FinishedQuiz.find({ grade: { $gt: 100 } })

    for (const attempt of belowRange) {
      expect(attempt.validateSync().errors.grade.message).toBe(VALUE_MUST_BE_ABOVE('grade', 0))
    }

    for (const attempt of aboveRange) {
      expect(attempt.validateSync().errors.grade.message).toBe(VALUE_MUST_BE_BELOW('grade', 100))
    }
  })

  it('should return FIELD_CANNOT_BE_EMPTY for missing question field in existing data', async () => {
    const emptyAnswers = await FinishedQuiz.find({
      'results.question': { $exists: true, $regex: '^.{0}$' }
    })

    for (const attempt of emptyAnswers) {
      const error = attempt.validateSync().errors['results.0.question']
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

    for (const attempt of tooShortQuestions) {
      const error = attempt.validateSync().errors['results.0.question']
      expect(error.message).toBe(FIELD_CANNOT_BE_SHORTER('question', 1))
    }

    for (const attempt of tooLongQuestions) {
      const error = attempt.validateSync().errors['results.0.question']
      expect(error.message).toBe(FIELD_CANNOT_BE_LONGER('question', 150))
    }
  })

  it('should return FIELD_CANNOT_BE_EMPTY for missing answer text in existing data', async () => {
    const emptyAnswers = await FinishedQuiz.find({
      'results.answers.text': { $exists: true, $regex: '^.{0}$' }
    })

    for (const attempt of emptyAnswers) {
      const error = attempt.validateSync().errors['results.0.answers.0.text']
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

    for (const attempt of tooShortAnswers) {
      const error = attempt.validateSync().errors['results.0.answers.0.text']
      expect(error.message).toBe(FIELD_CANNOT_BE_SHORTER('answer', 1))
    }

    for (const attempt of tooLongAnswers) {
      const error = attempt.validateSync().errors['results.0.answers.0.text']
      expect(error.message).toBe(FIELD_CANNOT_BE_LONGER('answer', 150))
    }
  })
})
