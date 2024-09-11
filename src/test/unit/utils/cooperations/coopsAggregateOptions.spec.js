const mongoose = require('mongoose')

const coopsAggregateOptions = require('~/utils/cooperations/coopsAggregateOptions')

const id = new mongoose.Types.ObjectId()
const optionsStatus = coopsAggregateOptions({ status: 'testStatus' })
const optionsSearch = coopsAggregateOptions({ search: 'testSearch' }, { id: id.toString(), role: 'testRole' })

describe('coopsAggregateOptions', () => {
  it('should match status if status is provided', () => {
    const matchOptionStatus = optionsStatus.find((option) => option.$match)
    expect(matchOptionStatus).toBeDefined()
    expect(matchOptionStatus.$match.status).toBeDefined()
  })

  it('should match search if search is provided', () => {
    const matchOptionSearch = optionsSearch.find((option) => option.$match)
    expect(matchOptionSearch).toBeDefined()
  })

  it('should sort by first name and last name in ascending order', () => {
    const options = coopsAggregateOptions({ sort: { orderBy: 'name', order: 'asc' } })

    const facetStage = options.find((stage) => Object.prototype.hasOwnProperty.call(stage, '$facet'))
    const facetItems = facetStage['$facet'].items
    const sort = facetItems.find((obj) => Object.prototype.hasOwnProperty.call(obj, '$sort'))['$sort']

    expect(sort['user.firstName']).toBe(1)
    expect(sort['user.lastName']).toBe(1)
  })
})
