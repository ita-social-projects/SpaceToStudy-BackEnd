const mongoose = require('mongoose')
const Offer = require('~/models/offer')
const Subject = require('~/models/subject')
const Category = require('~/models/category')
const User = require('~/models/user')
const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const migration = require('@root/migrations/20250328094040-remove-offers-with-non-existing-subjects')

describe('Migration: Remove offers with non-existing subjects', () => {
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

  it('up() should delete offers with non-existent subjects', async () => {
    const validSubjectId = new mongoose.Types.ObjectId()
    const invalidSubjectId = new mongoose.Types.ObjectId()
    const categoryId = new mongoose.Types.ObjectId()
    const authorId = new mongoose.Types.ObjectId()

    await Category.create({
      _id: categoryId,
      name: 'General'
    })

    await User.create({
      _id: authorId,
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'hashedPassword123'
    })

    await Subject.create({
      _id: validSubjectId,
      name: 'Math',
      category: categoryId
    })

    await Offer.insertMany([
      {
        _id: new mongoose.Types.ObjectId(),
        subject: validSubjectId,
        category: categoryId,
        author: authorId,
        title: 'Valid Offer',
        description: 'Some description',
        price: 10,
        status: 'active'
      },
      {
        _id: new mongoose.Types.ObjectId(),
        subject: invalidSubjectId,
        category: categoryId,
        author: authorId,
        title: 'Invalid Offer',
        description: 'Some other description',
        price: 5,
        status: 'active'
      }
    ])

    await migration.up(mongoose.connection.db)

    const remainingOffers = await Offer.find().lean()
    expect(remainingOffers).toHaveLength(1)
    expect(remainingOffers[0].subject.toString()).toBe(validSubjectId.toString())
  })

  it('Should do nothing in the down migration', async () => {
    await expect(migration.down(mongoose.connection.db)).resolves.not.toThrow()
  })
})
