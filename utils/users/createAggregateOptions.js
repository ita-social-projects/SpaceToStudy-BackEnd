const getRegex = require('../getRegex')

const generateOptions = (value) => {
  if (!value) {
    return [true, false]
  }
  const options = Array.isArray(value) ? value : [value]
  return options.map((option) => option === 'true')
}

const createAggregateOptions = (query) => {
  const {
    email,
    isEmailConfirmed,
    isFirstLogin,
    lastLogin = '{}',
    limit = 5,
    name = '',
    role,
    skip = 0,
    sort = '{}',
    status = []
  } = query
  const { from, to } = JSON.parse(lastLogin)
  const { orderBy, order } = JSON.parse(sort)
  const nameArray = name.trim().split(' ')
  const firstNameRegex = getRegex(nameArray[0])
  const lastNameRegex = getRegex(nameArray[1])

  const nameQuery = {
    $or: [
      { firstName: firstNameRegex, lastName: lastNameRegex },
      { firstName: lastNameRegex, lastName: firstNameRegex }
    ]
  }

  const match = {
    ...nameQuery,
    email: getRegex(email),
    isFirstLogin: { $in: generateOptions(isFirstLogin) },
    isEmailConfirmed: { $in: generateOptions(isEmailConfirmed) }
  }

  if (role) {
    match.role = role
  }

  if (from || to) {
    match.lastLogin = {}

    if (from) {
      match.lastLogin.$gte = new Date(from)
    }

    if (to) {
      match.lastLogin.$lte = new Date(new Date(to).setHours(23, 59, 59))
    }
  }

  if (status.length && role) {
    match['status.' + role] = { $in: status }
  }

  const sortOrder = order === 'asc' ? 1 : -1

  const sortByName = {
    firstName: sortOrder,
    lastName: sortOrder
  }

  const sortOption = orderBy === 'name' ? sortByName : { [orderBy]: sortOrder }

  return {
    match,
    sort: sortOption,
    limit: parseInt(limit),
    skip: parseInt(skip)
  }
}

module.exports = createAggregateOptions
