const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const Subject = require('~/models/subject')
const Category = require('~/models/category')

describe('Subject model', () => {
  let server

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should include all required fields in the subject documents', async () => {
    const subjects = await Subject.find({})

    for (const subject of subjects) {
      expect(subject).toHaveProperty('name')
      expect(subject).toHaveProperty('category')
      expect(subject).toHaveProperty('totalOffers')
      expect(subject.totalOffers).toHaveProperty('student')
      expect(subject.totalOffers).toHaveProperty('tutor')
      expect(subject).toHaveProperty('createdAt')
      expect(subject).toHaveProperty('updatedAt')
    }
  })

  it('should include all required fields in the subject documents', async () => {
    const subjects = await Subject.find({})

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

  it('should have unique name for each subject', async () => {
    const subjects = await Subject.find({}).select({ name: 1, _id: 0 })

    const names = subjects.map((subject) => subject.name)
    const uniqueNames = new Set(names)

    expect(names.length).toBe(uniqueNames.size)
  })

  it('should have valid category references', async () => {
    const subjects = await Subject.find({}).populate('category')

    for (const subject of subjects) {
      expect(subject.category).not.toBeNull()
      expect(subject.category).toBeInstanceOf(Category)
    }
  })
})
