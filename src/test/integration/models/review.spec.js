const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const Review = require('~/models/review')
const { enums } = require('~/consts/validation')

const reviewFields = [
  'comment',
  'rating',
  'author',
  'createdAt',
  'updatedAt',
  'targetUserId',
  'targetUserRole',
  'offer'
]

describe('Review model', () => {
  let server, reviews

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server

    reviews = await Review.find({})
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should have all required fields', () => {
    for (const review of reviews) {
      reviewFields.forEach((field) => {
        expect(review).toHaveProperty(field)
      })
    }
  })

  it('should have valid fields data types', () => {
    for (const review of reviews) {
      expect(typeof review.comment).toBe('string')
      expect(typeof review.rating).toBe('object')
      expect(typeof review.author).toBe('object')
      expect(typeof review.targetUserId).toBe('string')
      expect(typeof review.targetUserRole).toBe('string')
      expect(review.createdAt).toBeInstanceOf(Date)
      expect(review.updatedAt).toBeInstanceOf(Date)
    }
  })

  it('should have non-null required fields', () => {
    for (const review of reviews) {
      expect(review.comment).not.toBeNull()
    }
  })

  it('should have valid targetUserRole values', () => {
    for (const review of reviews) {
      expect(enums.MAIN_ROLE_ENUM).toContain(review.targetUserRole)
    }
  })

  it('should have rating field within valid length constraints', () => {
    for (const review of reviews) {
      expect(review.rating).toBeGreaterThanOrEqual(1)
      expect(review.rating).toBeLessThanOrEqual(5)
    }
  })
})
