const { recountTotalOffers } = require('~/cron-jobs/updateTotalOffers')
const categoryService = require('~/services/category')
const subjectService = require('~/services/subject')

jest.mock('~/services/category', () => ({
  recountTotalOffers: jest.fn()
}))

jest.mock('~/services/subject', () => ({
  recountTotalOffers: jest.fn()
}))

describe('updateTotalOffers Cron Job', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call categoryService recountTotalOffers function', async () => {
    await recountTotalOffers()

    expect(categoryService.recountTotalOffers).toBeCalledTimes(1)
  })

  it('should call subjectService recountTotalOffers function', async () => {
    await recountTotalOffers()

    expect(subjectService.recountTotalOffers).toBeCalledTimes(1)
  })
})
