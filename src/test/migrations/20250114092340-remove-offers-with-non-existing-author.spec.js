const mongoose = require('mongoose')

const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const Offer = require('~/models/offer')
const Cooperation = require('~/models/cooperation')
const migration = require('@root/migrations/20250114092340-remove-offers-with-non-existing-author')

const offerData = {
  price: 500,
  proficiencyLevel: ['Beginner'],
  title: 'The 12 Principles of Animation',
  description:
    'The 12 principles of animation serve as the foundational framework for creating realistic, expressive, and dynamic animations.',
  languages: ['English'],
  authorRole: 'tutor',
  enrolledUsers: [],
  subject: '673617d99b9f19766f53f9f4',
  category: '64884f59fdc2d1a130c24ac8',
  status: 'active'
}

const cooperationData = {
  offer: '6739b6993decba1e46b66a26',
  initiator: '5f5f5f5f5f5f5f5f5f5f5f5f',
  initiatorRole: 'student',
  receiver: '673615d36b214652201af558',
  receiverRole: 'tutor',
  title: 'The 12 Principles of Animation',
  proficiencyLevel: 'Beginner',
  price: 500,
  status: 'active',
  needAction: {
    role: 'tutor',
    type: 'price',
    messages: []
  },
  availableQuizzes: [],
  finishedQuizzes: [],
  sections: []
}

const userData = {
  email: 'john_doe@example.com',
  password: 'password'
}

const notValidAuthorId = '5f5f5f5f5f5f5f5f5f5f5f5f'

const offerWithInvalidAuthor = {
  ...offerData,
  author: notValidAuthorId
}

describe('20250113154034-remove-offers-with-non-existing-author.js', () => {
  let server

  beforeAll(async () => ({ server } = await serverInit()))

  afterEach(async () => await serverCleanup())

  afterAll(async () => {
    await migration.up(mongoose.connection.db)
    await stopServer(server)
  })

  it('should remove offers with non-existing author on migrate up', async () => {
    const invalidAuthorOffer = await Offer.create(offerWithInvalidAuthor)

    await migration.up(mongoose.connection.db)

    const nonExistentAuthorOffers = await Offer.find({ author: invalidAuthorOffer.author })
    expect(nonExistentAuthorOffers).toHaveLength(0)
  })

  it('should not remove offers with existing author on migrate up', async () => {
    const notValidatedUser = await mongoose.connection.db.collection('users').insertOne(userData)
    const offerWithValidAuthor = {
      ...offerData,
      author: notValidatedUser.insertedId
    }
    const validAuthorOffer = await Offer.create(offerWithValidAuthor)

    await migration.up(mongoose.connection.db)

    const existingAuthorOffers = await Offer.find({ author: validAuthorOffer.author })
    expect(existingAuthorOffers).toContainEqual(expect.objectContaining({ _id: validAuthorOffer._id }))
  })

  it('should remove cooperation with offer with non-existing author on migrate up', async () => {
    const invalidAuthorOffer = await Offer.create(offerWithInvalidAuthor)
    await Cooperation.create({
      ...cooperationData,
      offer: invalidAuthorOffer._id
    })

    await migration.up(mongoose.connection.db)

    const cooperationsWithRemovedOffer = await Cooperation.find({ offer: invalidAuthorOffer._id })
    expect(cooperationsWithRemovedOffer).toHaveLength(0)
  })
})
