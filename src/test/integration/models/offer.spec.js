const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const Offer = require('~/models/offer')

describe('Offer model', () => {
  let server

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should include all required fields', async () => {
    const offers = await Offer.find({})

    for (const offer of offers) {
      expect(offer).toHaveProperty('price')
      expect(offer).toHaveProperty('proficiencyLevel')
      expect(offer).toHaveProperty('title')
      expect(offer).toHaveProperty('description')
      expect(offer).toHaveProperty('languages')
      expect(offer).toHaveProperty('authorRole')
      expect(offer).toHaveProperty('author')
      expect(offer).toHaveProperty('enrolledUsers')
      expect(offer).toHaveProperty('subject')
      expect(offer).toHaveProperty('category')
      expect(offer).toHaveProperty('status')
      expect(offer).toHaveProperty('FAQ')
      expect(offer).toHaveProperty('createdAt')
      expect(offer).toHaveProperty('updatedAt')
    }
  })
})
