const Example = require('~/models/example')
const { serverInit } = require('~/test/helper')

describe('Example controller', () => {
  let app

  beforeAll(() => {
    app = serverInit()
  })

  it('getExample', async () => {
    const items = ['items']
    Example.find = jest.fn().mockResolvedValue(items)

    const response = await app.get('/example')

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ items })
  })

  it('postExample', async () => {
    const item = { title: 'test' }
    Example.prototype.save = jest.fn().mockResolvedValue(item)

    const response = await app.post('/example').send(item)

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({ item })
  })

  describe('deleteExample', () => {
    const exampleId = '62fe9e7dc4d05eed02ee90a3'

    it('found by id', async () => {
      const item = { example: 'example' }
      Example.findById = jest.fn().mockResolvedValue(item)
      Example.findByIdAndRemove = jest.fn()

      const response = await app.delete(`/example/${exampleId}`)

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({ message: 'Example deleted.' })

      expect(Example.findById).toBeCalledWith(exampleId)
      expect(Example.findByIdAndRemove).toBeCalledWith(exampleId)
    })

    it('not found by id', async () => {
      Example.findById = jest.fn().mockResolvedValue(undefined)
      Example.findByIdAndRemove = jest.fn()

      const response = await app.delete(`/example/${exampleId}`)

      expect(Example.findById).toBeCalledWith(exampleId)
      expect(Example.findByIdAndRemove).not.toBeCalled()

      expect(response.statusCode).toBe(404)
      expect(response.body).toBe('Could not find example.')
    })
  })
})
