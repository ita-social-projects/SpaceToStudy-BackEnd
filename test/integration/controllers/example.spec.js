const { serverInit, serverCleanup } = require('~/test/setup')
const { EXAMPLE_NOT_FOUND } = require('~/consts/errors')

describe('Example controller', () => {
  let app, server
  let savedItem
  const exampleItem = { title: 'test' }

  beforeAll(async () => {
    ({ app, server } = await serverInit())
  })

  afterAll(async () => {
    await serverCleanup(server)
  })

  it('postExample', async () => {
    const response = await app.post('/example').send(exampleItem)
    savedItem = response.body.item

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('item')
    expect(response.body.item).toEqual(expect.objectContaining(exampleItem))
  })

  it('getExample', async () => {
    const response = await app.get('/example')

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('items')
    expect(response.body.items).toEqual(expect.arrayContaining([savedItem]))
  })

  describe('deleteExample', () => {
    it('found by id', async () => {
      const response = await app.delete(`/example/${savedItem._id}`)

      expect(response.statusCode).toBe(204)
    })

    it('not found by id', async () => {
      const response = await app.delete(`/example/${savedItem._id}`)

      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({ ...EXAMPLE_NOT_FOUND, status: 404 })
    })
  })
})
