const subjectService = require('~/services/subject.js')
const Subject = require('~/models/subject')

jest.mock('~/models/subject', () => ({
  aggregate: jest.fn(),
  bulkWrite: jest.fn()
}))

describe('recountTotalOffers', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call Subject.aggregate', async () => {
    Subject.aggregate.mockResolvedValue([{ _id: 1, totalOffers: 5 }])
    await subjectService.recountTotalOffers()

    expect(Subject.aggregate).toHaveBeenCalled()
  })

  it('should call Subject.bulkWrite', async () => {
    Subject.aggregate.mockResolvedValue([{ _id: 1, totalOffers: 5 }])
    await subjectService.recountTotalOffers()

    expect(Subject.bulkWrite).toHaveBeenCalledWith([
      { updateOne: { filter: { _id: 1 }, update: { $set: { totalOffers: 5 } } } }
    ])
  })
})
