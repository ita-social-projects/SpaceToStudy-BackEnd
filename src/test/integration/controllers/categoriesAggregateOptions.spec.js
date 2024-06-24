const categoriesAggregateOptions = require('~/utils/categories/categoriesAggregateOptions')

const sortOptionIndex = 3

const checkPropertySortOption = (res, query, sortParam) => {
  const result = categoriesAggregateOptions(query)
  expect(result).toBeDefined()
  expect(result[sortOptionIndex].$sort[sortParam]).toBe(res)
}

describe('categoriesAggregateOptions', () => {
  it('should correctly handle search by name', () => {
    const result = categoriesAggregateOptions({ name: 'testName' })
    expect(result).toBeDefined()
  })

  it('should sort by updatedAt in descending order by default', () => {
    checkPropertySortOption(-1, { sort: undefined }, 'updatedAt')
  })

  it('should correctly handle sorting (Object) by totalOffers in ascending order', () => {
    checkPropertySortOption(1, { sort: { order: 'asc', orderBy: 'totalOffersSum' } }, 'totalOffersSum')
  })

  it('should correctly handle sorting (Object) by totalOffers in descending order', () => {
    checkPropertySortOption(-1, { sort: { order: 'desc', orderBy: 'totalOffersSum' } }, 'totalOffersSum')
  })

  it('should correctly handle sorting (String) by totalOffers in ascending order', () => {
    checkPropertySortOption(1, { sort: 'totalOffersAsc' }, 'totalOffersSum')
  })

  it('should correctly handle sorting (String) by totalOffers in descending order', () => {
    checkPropertySortOption(-1, { sort: 'totalOffersDesc' }, 'totalOffersSum')
  })
})
