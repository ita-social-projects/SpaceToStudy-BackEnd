const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const Offer = require('~/models/offer')

const offerFields = [
  'price',
  'proficiencyLevel',
  'title',
  'description',
  'languages',
  'authorRole',
  'author',
  'enrolledUsers',
  'subject',
  'category',
  'status',
  'FAQ',
  'createdAt',
  'updatedAt'
]

describe('Offer model', () => {
  let server

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should include all fields', async () => {
    const offers = await Offer.find({})

    for (const offer of offers) {
      offerFields.forEach((field) => {
        expect(offer).toHaveProperty(field)
      })
    }
  })

  it('should not have any extra fields', async () => {
    const offers = await Offer.find({})

    for (const offer of offers) {
      const extraFields = Object.keys(offer).filter((key) => !offerFields.includes(key))
      expect(extraFields.length).toBe(0)
    }
  })

  it('should have valid fields data types', async () => {
    const offers = await Offer.find({})

    for (const offer of offers) {
      expect(typeof offer.price).toBe('number')
      expect(Array.isArray(offer.proficiencyLevel)).toBe(true)
      expect(typeof offer.title).toBe('string')
      expect(typeof offer.description).toBe('string')
      expect(Array.isArray(offer.languages)).toBe(true)
      expect(typeof offer.authorRole).toBe('string')
      expect(typeof offer.author).toBe('object')
      expect(Array.isArray(offer.enrolledUsers)).toBe(true)
      expect(typeof offer.subject).toBe('object')
      expect(typeof offer.category).toBe('object')
      expect(typeof offer.status).toBe('string')
      expect(Array.isArray(offer.FAQ)).toBe(true)
      expect(offer.createdAt).toBeInstanceOf(Date)
      expect(offer.updatedAt).toBeInstanceOf(Date)
    }
  })

  it('should have valid items in the FAQ array', async () => {
    const offers = await Offer.find({})

    for (const offer of offers) {
      expect(Array.isArray(offer.FAQ)).toBe(true)

      if (offer.FAQ.length > 0) {
        for (const faq of offer.FAQ) {
          expect(faq).toHaveProperty('question')
          expect(faq).toHaveProperty('answer')
        }
      }
    }
  })
})
