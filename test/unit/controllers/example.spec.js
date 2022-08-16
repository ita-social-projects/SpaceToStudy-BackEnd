const Example = require('~/models/example')
const exampleController = require('~/controllers/example')
const { response } = require('~test/helper.js')

describe('Example controller', () => {
  const res = response()

  afterEach(() => {
    res.restore()
    jest.restoreAllMocks()
  })

  it('getExample', async () => {
    const items = ['items']
    Example.find = jest.fn().mockResolvedValue(items)

    await exampleController.getExample({}, res)
    expect(res.statusCode).toBe(200)
    expect(res.data).toEqual({ items })
  })

  it('postExample', async () => {
    const req = {
      body: { title: 'test' }
    }
    const item = { example: 'example' }
    Example.prototype.save = jest.fn().mockResolvedValue(item)

    await exampleController.postExample(req, res)
    expect(res.statusCode).toBe(201)
    expect(res.data).toEqual({ item })
  })

  describe('deleteExample', () => {
    const exampleId = 'exampleId'

    const req = {
      params: { exampleId }
    }

    it('found by id', async () => {
      const item = { example: 'example' }
      Example.findById = jest.fn().mockResolvedValue(item)
      Example.findByIdAndRemove = jest.fn()

      await exampleController.deleteExample(req, res)

      expect(res.statusCode).toBe(200)
      expect(res.data).toEqual({ message: 'Example deleted.' })

      expect(Example.findById).toBeCalledWith(exampleId)
      expect(Example.findByIdAndRemove).toBeCalledWith(exampleId)
    })

    it('not found by id', async () => {

      Example.findById = jest.fn().mockResolvedValue(undefined)
      Example.findByIdAndRemove = jest.fn()

      await exampleController.deleteExample(req, res)

      expect(Example.findById).toBeCalledWith(exampleId)
      expect(Example.findByIdAndRemove).not.toBeCalled()

      expect(res.statusCode).toBe(404)
      expect(res.data).toBe('Could not find example.')
    })
  })
})
