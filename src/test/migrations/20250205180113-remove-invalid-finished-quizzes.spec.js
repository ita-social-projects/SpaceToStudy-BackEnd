const mongoose = require('mongoose')

const FinishedQuiz = require('~/models/finishedQuiz')
const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const migration = require('@root/migrations/20250205180113-remove-invalid-finished-quizzes')

describe('Migration: Add fields to quizzes', () => {
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

  beforeEach(async () => {
    await FinishedQuiz.insertMany([
      {
        _id: mongoose.Types.ObjectId(),
        quiz: mongoose.Types.ObjectId(),
        grade: 79,
        results: [
          {
            question: 'Asdf?',
            answers: [
              {
                text: 'asdf?',
                isCorrect: true,
                isChosen: false
              },
              {
                text: 'not asdf?',
                isCorrect: false,
                isChosen: true
              }
            ]
          }
        ]
      }
    ])
  })

  it('up() should delete invalid finished quiz', async () => {
    await migration.up(mongoose.connection.db)

    const finishedQuizzes = await FinishedQuiz.find().lean()

    expect(finishedQuizzes).toStrictEqual([])
  })
})
