const mongoose = require('mongoose')

const Quiz = require('~/models/quiz')
const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const migration = require('@root/migrations/20250121180446-add-fields-to-quiz')

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
    await Quiz.insertMany([
      { _id: mongoose.Types.ObjectId(), title: 'Some title', author: mongoose.Types.ObjectId(), settings: {} },
      { _id: mongoose.Types.ObjectId(), title: 'Some title', author: mongoose.Types.ObjectId(), settings: {} }
    ])
  })

  it('up() should add fields to settings', async () => {
    await migration.up(mongoose.connection.db)

    const quizzes = await Quiz.find().lean()

    quizzes.forEach((quiz) => {
      expect(quiz.settings).toEqual(
        expect.objectContaining({
          timeLimit: 'No limit',
          attemptLimit: 'No limit'
        })
      )
    })
  })

  it('down() should remove fields from settings', async () => {
    await migration.down(mongoose.connection.db)

    const quizzes = await Quiz.find().lean()

    quizzes.forEach((quiz) => {
      expect(quiz.settings).not.toHaveProperty('timeLimit')
      expect(quiz.settings).not.toHaveProperty('attemptLimit')
    })
  })
})
