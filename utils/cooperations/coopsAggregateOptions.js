const coopsAggregateOptions = (params) => {
  const { id } = params

  let match = {}

  if (id) {
    match['$or'] = [{ initiatorUserId: id }, { recipientUserId: id }]
  }

  return { match }
}

module.exports = coopsAggregateOptions
