const Example = require('~/models/example')
const exampleController = require('~/controllers/example')

describe('Example controller', () => {
  const res = {
    statusCode: undefined,
    data: undefined,
    status: (code) => {
      res.statusCode = code
      return res
    },
    json: (data) => {
      res.data = data
    },
    restore: () => {
      res.statusCode = undefined
      res.data = undefined
    }
  }

  afterEach(() => {
    res.restore()
  })

  it('getExample',async () => {
    const items = ['items']

    sandbox.stub(Example, 'find')
    Example.find.returns(items)

    await exampleController.getExample({}, res)
    expect(res.statusCode).to.be.equal(200)
    expect(res.data).to.deep.equal({ items })
  })

  it('postExample',async () => {
    const req = {
      body: { title: 'test' }
    }

    const item = { example: 'example' }

    sandbox.stub(Example.prototype, 'save')
    Example.prototype.save.returns(item)

    await exampleController.postExample(req, res)
    expect(res.statusCode).to.be.equal(201)
    expect(res.data).to.deep.equal({ item })
  })

  describe('deleteExample', () => {
    const exampleId = 'exampleId'

    const req = {
      params: { exampleId }
    }

    it('found by id',async () => {
      const findById = sandbox.stub(Example, 'findById')
      const findByIdAndRemove = sandbox.stub(Example, 'findByIdAndRemove')

      Example.findById.returns({ example: 'example' })

      await exampleController.deleteExample(req, res)

      expect(res.statusCode).to.be.equal(200)
      expect(res.data).to.deep.equal({ message: 'Example deleted.' })

      expect(findById).to.have.been.calledWith(exampleId)
      expect(findByIdAndRemove).to.have.been.calledWith(exampleId)

      Example.findById.restore()
      Example.findByIdAndRemove.restore()
    })

    it('not found by id',async () => {
      const findById = sandbox.stub(Example, 'findById')
      const findByIdAndRemove = sandbox.stub(Example, 'findByIdAndRemove')

      Example.findById.returns(undefined)

      await exampleController.deleteExample(req, res)

      expect(findById).to.have.been.calledWith(exampleId)
      expect(findByIdAndRemove).to.have.not.been.called

      expect(res.statusCode).to.be.equal(404)
      expect(res.data).to.be.equal('Could not find example.')
    })
  })
})
