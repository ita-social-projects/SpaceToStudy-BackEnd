const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const Category = require('~/models/category')

const categoriesFields = [
  '_id',
  'name',
  'appearance',
  'appearance.icon',
  'appearance.color',
  'totalOffers',
  'totalOffers.student',
  'totalOffers.tutor',
  'createdAt',
  'updatedAt'
]

describe('Category model', () => {
  let server, categories

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server

    categories = await Category.find({})
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should have all required fields', () => {
    for (const category of categories) {
      categoriesFields.forEach((field) => {
        expect(category).toHaveProperty(field)
      })
    }
  })

  it('should have valid fields data types', () => {
    for (const category of categories) {
      expect(typeof category.name).toBe('string')
      expect(typeof category.appearance).toBe('object')
      expect(typeof category.appearance.icon).toBe('string')
      expect(typeof category.appearance.color).toBe('string')
      expect(typeof category.totalOffers).toBe('object')
      expect(typeof category.totalOffers.student).toBe('number')
      expect(typeof category.totalOffers.tutor).toBe('number')
      expect(category.createdAt).toBeInstanceOf(Date)
      expect(category.updatedAt).toBeInstanceOf(Date)
    }
  })

  it('should have unique name', () => {
    const names = categories.map((category) => category.name)
    const uniqueNames = new Set(names)

    expect(names.length).toBe(uniqueNames.size)
  })

  it('should have non-null required fields', () => {
    for (const category of categories) {
      expect(category.name).not.toBeNull()
      expect(category.appearance).not.toBeNull()
      expect(category.appearance.icon).not.toBeNull()
      expect(category.appearance.color).not.toBeNull()
    }
  })
})
