const getRegex = require('../getRegex')

const coopsAggregateOptions = (params = {}, query) => {
  const { skip = 0, limit = 5, status = 'all', order = 'updatedAt', orderBy = 'asc' } = query

  const match = {}
  const sort = {}

  if (order === 'name') sort.initiatorFullName = orderBy
  else if (order === 'subject') sort.subjectName = orderBy
  else sort.updatedAt = orderBy

  if (status === 'all') match.status = getRegex()
  else match.status = getRegex(status)
  if (id) {
    match['$or'] = [{ initiatorUserId: id }, { recipientUserId: id }]
  }

  return { skip, limit, match, sort }
}

module.exports = coopsAggregateOptions
