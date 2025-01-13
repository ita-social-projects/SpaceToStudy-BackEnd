const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const Attachment = require('~/models/attachment')

describe('Attachment Model', () => {
  let server

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should validate the author field references a real user', async () => {
    const attachments = await Attachment.find({}).populate('author')
    for (const attachment of attachments) {
      expect(attachment.author).toBeDefined()
      expect(attachment.author).not.toBeNull()
      expect(attachment.author).toHaveProperty('firstName')
    }
  })

  it('should validate the fileName field is valid', async () => {
    const attachments = await Attachment.find({})
    for (const attachment of attachments) {
      expect(attachment.fileName).toBeDefined()
      expect(typeof attachment.fileName).toBe('string')
      expect(attachment.fileName.length).toBeGreaterThanOrEqual(5)
      expect(attachment.fileName.length).toBeLessThanOrEqual(55)
    }
  })

  it('should validate the description field is valid if present', async () => {
    const attachments = await Attachment.find({})
    for (const attachment of attachments) {
      if (attachment.description) {
        expect(typeof attachment.description).toBe('string')
        expect(attachment.description.length).toBeLessThanOrEqual(150)
      }
    }
  })

  it('should validate the link field is valid', async () => {
    const attachments = await Attachment.find({})
    for (const attachment of attachments) {
      expect(attachment.link).toBeDefined()
      expect(typeof attachment.link).toBe('string')
      expect(attachment.link.length).toBeGreaterThan(0)
    }
  })

  it('should validate the size field is valid', async () => {
    const attachments = await Attachment.find({})
    for (const attachment of attachments) {
      expect(attachment.size).toBeDefined()
      expect(typeof attachment.size).toBe('number')
      expect(attachment.size).toBeGreaterThan(0)
    }
  })

  it('should validate the category field references a real category if present', async () => {
    const attachments = await Attachment.find({}).populate('category')
    for (const attachment of attachments) {
      if (attachment.category) {
        expect(attachment.category).toBeDefined()
        expect(attachment.category).toHaveProperty('name')
      }
    }
  })

  it('should validate the resourceType field contains a valid value', async () => {
    const attachments = await Attachment.find({})
    for (const attachment of attachments) {
      expect(Attachment.schema.path('resourceType').enumValues).toContain(attachment.resourceType)
    }
  })

  it('should validate the isDuplicate field is a boolean if present', async () => {
    const attachments = await Attachment.find({})
    for (const attachment of attachments) {
      if (attachment.isDuplicate !== undefined) {
        expect(typeof attachment.isDuplicate).toBe('boolean')
      }
    }
  })

  it('should validate timestamps exist and are correct', async () => {
    const attachments = await Attachment.find({})
    for (const attachment of attachments) {
      expect(attachment).toHaveProperty('createdAt')
      expect(attachment).toHaveProperty('updatedAt')
      expect(new Date(attachment.createdAt).getTime()).toBeLessThanOrEqual(Date.now())
      expect(new Date(attachment.updatedAt).getTime()).toBeLessThanOrEqual(Date.now())
    }
  })
})
