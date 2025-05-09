const mongoose = require('mongoose')
const Offer = require('~/models/offer')
const User = require('~/models/user')
const Subject = require('~/models/subject')
const Category = require('~/models/category')
const migration = require('@root/migrations/20250328105719-remove-cooperations-with-non-existing-offers')
const { serverInit, serverCleanup, stopServer } = require('~/test/setup')

describe('Migration: Remove cooperation with invalid offers (full schema)', () => {
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

  it('should delete cooperation with non-existent offer and keep valid one', async () => {
    const authorId = new mongoose.Types.ObjectId()
    const initiatorId = new mongoose.Types.ObjectId()
    const receiverId = new mongoose.Types.ObjectId()
    const categoryId = new mongoose.Types.ObjectId()
    const subjectId = new mongoose.Types.ObjectId()
    const validOfferId = new mongoose.Types.ObjectId()
    const invalidOfferId = new mongoose.Types.ObjectId()

    await User.insertMany([
      { _id: authorId, firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'password123' },
      { _id: initiatorId, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', password: 'password123' },
      { _id: receiverId, firstName: 'Bob', lastName: 'Brown', email: 'bob@example.com', password: 'password123' }
    ])

    await Category.create({ _id: categoryId, name: 'General' })
    await Subject.create({ _id: subjectId, name: 'Math', category: categoryId })

    await Offer.create({
      _id: validOfferId,
      author: authorId,
      subject: subjectId,
      category: categoryId,
      title: 'Valid Offer',
      description: 'Some description',
      price: 100,
      status: 'active'
    })

    await mongoose.connection.db.collection('cooperation').insertMany([
      {
        _id: new mongoose.Types.ObjectId(),
        offer: validOfferId,
        initiator: initiatorId,
        receiver: receiverId,
        title: 'Valid cooperation',
        price: 100,
        proficiencyLevel: 'Beginner',
        needAction: {
          type: 'waiting for approval',
          role: 'student'
        },
        status: 'pending'
      },
      {
        _id: new mongoose.Types.ObjectId(),
        offer: invalidOfferId,
        initiator: initiatorId,
        receiver: receiverId,
        title: 'Broken cooperation',
        price: 100,
        proficiencyLevel: 'Beginner',
        needAction: {
          type: 'waiting for approval',
          role: 'student'
        },
        status: 'pending'
      }
    ])

    await migration.up(mongoose.connection.db)

    const remaining = await mongoose.connection.db.collection('cooperation').find({}).toArray()
    expect(remaining).toHaveLength(1)
    expect(remaining[0].offer.toString()).toBe(validOfferId.toString())
  })
})
