const getRegex = require('../getRegex')

const coopsAggregateOptions = (params = {}, query) => {
  const { skip = 0, limit = 5, status = 'all', order = 'updatedAt', orderBy = 'asc' } = query

  const match = {}
  const sort = { [order]: orderBy }
  if (id) {
    match['$or'] = [{ initiatorUserId: id }, { recipientUserId: id }]
  }

  if (status === 'all') match.status = getRegex()
  else match.status = getRegex(status)

  return { skip, limit, match, sort }
}

module.exports = coopsAggregateOptions
