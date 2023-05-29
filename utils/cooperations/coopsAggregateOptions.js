const getRegex = require('../getRegex')

const coopsAggregateOptions = (params = {}, query) => {
  const { skip = 0, limit = 5, status = '', order = 'updatedAt', orderBy = 'asc', search } = query

  const match = {}
  const sort = {}

  if (order) sort[order] = orderBy

  if (status) match.status = getRegex(status)
  if (id) {
    match['$or'] = [{ initiatorUserId: id }, { recipientUserId: id }]
  }

  if (search) match.fullName = getRegex(search)

  return { skip, limit, match, sort }
}

module.exports = coopsAggregateOptions
