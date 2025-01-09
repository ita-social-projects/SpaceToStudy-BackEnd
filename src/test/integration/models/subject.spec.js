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
    const subjects = await Subject.find({}).limit(100)

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
})
