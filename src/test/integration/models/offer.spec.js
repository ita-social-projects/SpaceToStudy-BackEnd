const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const Offer = require('~/models/offer')
const { mongooseDefaultInternalFields } = require('~/consts/mongoFields')
const {
  enums: { SPOKEN_LANG_ENUM, PROFICIENCY_LEVEL_ENUM, MAIN_ROLE_ENUM, OFFER_STATUS_ENUM }
} = require('~/consts/validation')

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
  let server, offers

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server

    offers = await Offer.find({})
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should have all expected fields', async () => {
    for (const offer of offers) {
      offerFields.forEach((field) => {
        expect(offer).toHaveProperty(field)
      })
    }
  })

  it('should not have any extra fields', async () => {
    for (const offer of offers) {
      const extraFields = Object.keys(offer).filter(
        (key) => !offerFields.includes(key) && !mongooseDefaultInternalFields.includes(key)
      )
      expect(extraFields.length).toBe(0)
    }
  })

  it('should have valid fields data types', async () => {
    for (const offer of offers) {
      expect(typeof offer.price).toBe('number')
      expect(typeof offer.title).toBe('string')
      expect(typeof offer.description).toBe('string')
      expect(typeof offer.authorRole).toBe('string')
      expect(offer.status === null || typeof offer.status === 'string').toBe(true)

      expect(typeof offer.author).toBe('object')
      expect(typeof offer.subject).toBe('object')
      expect(typeof offer.category).toBe('object')

      expect(Array.isArray(offer.proficiencyLevel)).toBe(true)
      expect(Array.isArray(offer.languages)).toBe(true)
      expect(Array.isArray(offer.enrolledUsers)).toBe(true)
      expect(Array.isArray(offer.FAQ)).toBe(true)

      expect(offer.createdAt).toBeInstanceOf(Date)
      expect(offer.updatedAt).toBeInstanceOf(Date)
    }
  })

  it('should have valid items in the FAQ array', async () => {
    const offersWithFAQItems = await Offer.find({ FAQ: { $type: 'array', $ne: [] } }).select({ FAQ: true, _id: false })

    for (const offer of offersWithFAQItems) {
      for (const FAQItem of offer.FAQ) {
        expect(FAQItem).toHaveProperty('question')
        expect(FAQItem).toHaveProperty('answer')

        expect(typeof FAQItem.question).toBe('string')
        expect(typeof FAQItem.answer).toBe('string')
      }
    }
  })

  it('should have valid items in the languages array', async () => {
    const offersWithLanguagesItems = await Offer.find({ languages: { $type: 'array', $ne: [] } }).select({
      languages: true,
      _id: false
    })

    for (const offer of offersWithLanguagesItems) {
      for (const language of offer.languages) {
        expect(typeof language).toBe('string')

        expect(SPOKEN_LANG_ENUM).toContain(language)
      }
    }
  })

  it('should have a price greater than or equal to the minimum value', async () => {
    for (const offer of offers) {
      expect(offer.price).toBeGreaterThanOrEqual(1)
    }
  })

  it('should have proficiency levels within the allowed enum values', async () => {
    for (const offer of offers) {
      for (const level of offer.proficiencyLevel) {
        expect(PROFICIENCY_LEVEL_ENUM).toContain(level)
      }
    }
  })

  it('should have a title with a valid length', async () => {
    for (const offer of offers) {
      expect(offer.title.length).toBeGreaterThanOrEqual(1)
      expect(offer.title.length).toBeLessThanOrEqual(100)
    }
  })

  it('should have a description with a valid length', async () => {
    for (const offer of offers) {
      expect(offer.description.length).toBeGreaterThanOrEqual(1)
      expect(offer.description.length).toBeLessThanOrEqual(1000)
    }
  })

  it('should have author roles within the allowed enum values', async () => {
    for (const offer of offers) {
      expect(MAIN_ROLE_ENUM).toContain(offer.authorRole)
    }
  })

  it('should have a valid status if it is not null', async () => {
    for (const offer of offers) {
      if (offer.status !== null) {
        expect(OFFER_STATUS_ENUM).toContain(offer.status)
      }
    }
  })
})
