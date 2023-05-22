const getRegex = require('../getRegex')

const coopsAggregateOptions = (params = {}, query) => {
  const { skip = 0, limit = 5, status = '', order = 'updatedAt', orderBy = 'asc', search } = query

  const match = {}
  const sort = {}

  if (order === 'name') sort.initiatorFullName = orderBy
  else sort.updatedAt = orderBy

  if (status) match.status = getRegex(status)
  if (id) {
    match['$or'] = [{ initiatorUserId: id }, { recipientUserId: id }]
  }

  return { skip, limit, match, sort }
}

module.exports = coopsAggregateOptions
