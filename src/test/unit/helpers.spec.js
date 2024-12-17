const mongoose = require('mongoose')
const { createError } = require('~/utils/errorsHelper')
const { READ_ONLY_ERROR } = require('~/consts/errors')
const restrictedOperations = require('~/consts/restrictedOperations')

jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose')
  return {
    ...actualMongoose,
    connect: jest.fn(),
    model: actualMongoose.model,
    Schema: actualMongoose.Schema
  }
})

describe('Restricted Operations', () => {
  it('should throw READ_ONLY_ERROR when calling restricted operations', async () => {
    const model = mongoose.model('Test', new mongoose.Schema({ name: String }))

    restrictedOperations.forEach((operation) => {
      model[operation] = async () => {
        throw createError(403, READ_ONLY_ERROR)
      }
    })

    for (const operation of restrictedOperations) {
      await expect(model[operation]()).rejects.toThrow(READ_ONLY_ERROR)
    }
  })
})
