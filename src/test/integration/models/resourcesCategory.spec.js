const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const ResourcesCategory = require('~/models/resourcesCategory')
const User = require('~/models/user')

describe('ResourcesCategory model', () => {
  let server

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should include all required fields', async () => {
    const resourcesCategory = await ResourcesCategory.find({})

    for (const resources of resourcesCategory) {
      expect(resources).toHaveProperty('name')
      expect(resources).toHaveProperty('author')
      expect(resources).toHaveProperty('createdAt')
      expect(resources).toHaveProperty('updatedAt')
    }
  })

  it('should have valid fields data types', async () => {
    const resourcesCategory = await ResourcesCategory.find({})

    for (const resources of resourcesCategory) {
      expect(typeof resources.name).toBe('string')
      expect(typeof resources.author).toBe('object')
      expect(resources.createdAt).toBeInstanceOf(Date)
      expect(resources.updatedAt).toBeInstanceOf(Date)
    }
  })

  it('should not allow empty name field', async () => {
    const resourcesCategory = await ResourcesCategory.find({})

    for (const resources of resourcesCategory) {
      expect(resources.name).not.toBeNull()
      expect(resources.name.trim()).not.toEqual('')
    }
  })

  it('should validate length constraints of name field', async () => {
    const resourcesCategory = await ResourcesCategory.find({})

    for (const resources of resourcesCategory) {
      if (resources.name) {
        expect(resources.name.length).toBeGreaterThanOrEqual(1)
        expect(resources.name.length).toBeLessThanOrEqual(50)
      }
    }
  })

  it('should not allow empty author field', async () => {
    const resourcesCategory = await ResourcesCategory.find({})

    for (const resources of resourcesCategory) {
      expect(resources.author).not.toBeNull()
    }
  })

  it('should have valid User references in author field', async () => {
    const resourcesCategory = await ResourcesCategory.find({})

    for (const resources of resourcesCategory) {
      expect(resources.author).not.toBeNull()

      const user = await User.findById(resources.author)
      expect(user).not.toBeNull()
      expect(user).toBeInstanceOf(User)
    }
  })
})
