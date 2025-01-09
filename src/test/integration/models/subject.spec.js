const Subject = require('~/models/subject')
const { setupTestServer, stopServer } = require('~/test/setupSafeTest')

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
    const subjects = await Subject.aggregate([
      { $group: { _id: '$createdAt', firstDocumentWithDate: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$firstDocumentWithDate' } },
      { $limit: 100 }
    ])

    for (const subject of subjects) {
      expect(subject).toHaveProperty('name')
      expect(subject).toHaveProperty('category')
      expect(subject).toHaveProperty('totalOffers')
      expect(subject.totalOffers).toHaveProperty('student')
      expect(subject.totalOffers).toHaveProperty('tutor')
    }
  })

  it('should include all required fields in the subject documents', async () => {
    const subjects = await Subject.find({}).limit(100)

    for (const subject of subjects) {
      expect(typeof subject.name).toBe('string')
      expect(typeof subject.category).toBe('object')
      expect(typeof subject.totalOffers).toBe('object')
      expect(typeof subject.totalOffers.student).toBe('number')
      expect(typeof subject.totalOffers.tutor).toBe('number')
    }
  })
})
