const offerAggregateOptions = require('~/utils/offers/offerAggregateOptions')

const stringSort = 'price'
const authorRoleSort = 'author.averageRating.testAuthorRole'

const checkProperty = (query = {}, params = {}, user = {}) => {
  const result = offerAggregateOptions(query, params, user)
  expect(result).toBeDefined()
}

const checkPropertySortOption = (res, query = {}, sortParam = query.sort.orderBy, params = {}, user = {}) => {
  const result = offerAggregateOptions(query, params, user)
  expect(result).toBeDefined()
  expect(result[9].$sort[sortParam]).toBe(res)
}

describe('offerAggregateOptions', () => {
  it('should correctly handle search', () => {
    checkProperty({ search: 'testSearch' })
  })

  it('should correctly handle search with id', () => {
    checkProperty({ search: 'testSearch' }, { id: '6329a45601bd35b5fff1cf8c' })
  })

  it('should correctly handle authorId', () => {
    checkProperty({}, { id: '6329a45601bd35b5fff1cf8c' })
  })

  it('should correctly handle authorRole', () => {
    checkProperty({ authorRole: 'testAuthorRole' })
  })

  it('should correctly handle proficiencyLevel', () => {
    checkProperty({ proficiencyLevel: 'testProficiencyLevel' })
  })

  it('should correctly handle Price', () => {
    checkProperty({ price: 'testPrice' })
  })

  it('should correctly handle Rating', () => {
    checkProperty({ rating: 'testRating' })
  })

  it('should correctly handle language', () => {
    checkProperty({ language: 'testlanguage' })
  })

  it('should correctly handle languages', () => {
    checkProperty({ languages: 'testlanguages' })
  })

  it('should correctly handle status', () => {
    checkProperty({ status: 'testStatus' })
  })

  it('should correctly handle nativeLanguage', () => {
    checkProperty({ nativeLanguage: 'testNativeLanguage' })
  })

  it('should correctly handle categoryId', () => {
    checkProperty({}, { categoryId: '6329a45601bd35b5fff1cf8c' })
  })

  it('should correctly handle subjectId', () => {
    checkProperty({}, { subjectId: '6329a45601bd35b5fff1cf8c' })
  })

  it('should correctly handle excludedOfferId', () => {
    checkProperty({ excludedOfferId: '6329a45601bd35b5fff1cf8c' })
  })

  it('should correctly handle sorting Object with SortOption = 1', () => {
    checkPropertySortOption(1, { sort: { order: 'asc', orderBy: 'price' } })
  })

  it('should correctly handle sorting Object with SortOption = -1', () => {
    checkPropertySortOption(-1, { sort: { order: 'a', orderBy: 'price' } })
  })

  it('should incorrectly handle sorting Object with SortOption = undefined', () => {
    checkPropertySortOption(undefined, { sort: { orderBy: 'price' } })
  })

  it('should correctly handle sorting string with SortOption = 1', () => {
    checkPropertySortOption(1, { sort: 'priceAsc' }, stringSort)
  })

  it('should correctly handle sorting string with SortOption = -1', () => {
    checkPropertySortOption(-1, { sort: 'priceDesc' }, stringSort)
  })

  it('should correctly handle sorting authorRole with SortOption = -1', () => {
    checkPropertySortOption(-1, { sort: 'rating', authorRole: 'testAuthorRole' }, authorRoleSort)
  })
})
