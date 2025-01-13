const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const Subject = require('~/models/subject')
const Category = require('~/models/category')

const subjectFields = [
  'name',
  'category',
  'totalOffers',
  'createdAt',
  'updatedAt',
  '_id',
  'totalOffers.student',
  'totalOffers.tutor'
]

describe('Subject model', () => {
  let server, subjects

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server

    subjects = await Subject.find({})
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should have all required fields', () => {
    for (const subject of subjects) {
      subjectFields.forEach((field) => {
        expect(subject).toHaveProperty(field)
      })
    }
  })

  it('should have valid fields data types', () => {
    for (const subject of subjects) {
      expect(typeof subject.name).toBe('string')
      expect(typeof subject.category).toBe('object')
      expect(typeof subject.totalOffers).toBe('object')
      expect(typeof subject.totalOffers.student).toBe('number')
      expect(typeof subject.totalOffers.tutor).toBe('number')
      expect(subject.createdAt).toBeInstanceOf(Date)
      expect(subject.updatedAt).toBeInstanceOf(Date)
    }
  })

  it('should have unique name', () => {
    const names = subjects.map((subject) => subject.name)
    const uniqueNames = new Set(names)

    expect(names.length).toBe(uniqueNames.size)
  })

  it('should have valid category references', async () => {
    const subjectsWithCategories = await Subject.find({}).select({ category: true }).populate('category')

    for (const subject of subjectsWithCategories) {
      expect(subject.category).not.toBeNull()
      expect(subject.category).toBeInstanceOf(Category)
    }
  })

  it('should have non-null required fields', () => {
    for (const subject of subjects) {
      expect(subject.name).not.toBeNull()
      expect(subject.category).not.toBeNull()
    }
  })
})
