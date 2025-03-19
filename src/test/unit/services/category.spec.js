const categoryService = require('~/services/category.js')
const Category = require('~/models/category')

jest.mock('~/models/category', () => ({
  aggregate: jest.fn(),
  bulkWrite: jest.fn()
}))

describe('recountTotalOffers', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call Category.aggregate', async () => {
    Category.aggregate.mockResolvedValue([{ _id: 1, totalOffers: 5 }])
    await categoryService.recountTotalOffers()

    expect(Category.aggregate).toHaveBeenCalled()
  })

  it('should call Category.bulkWrite', async () => {
    Category.aggregate.mockResolvedValue([{ _id: 1, totalOffers: 5 }])
    await categoryService.recountTotalOffers()

    expect(Category.bulkWrite).toHaveBeenCalledWith([
      { updateOne: { filter: { _id: 1 }, update: { $set: { totalOffers: 5 } } } }
    ])
  })
})
