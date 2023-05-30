const mongoose = require('mongoose')
const getRegex = require('../getRegex')

const coopsAggregateOptions = (params = {}, query) => {
  const { id } = params
  const { skip = 0, limit = 5, status = '', sort = '{ order: "updatedAt", orderBy: "asc" }', search } = query
  const match = {}

  if (status) match.status = getRegex(status)
  if (id) match.$or = [{ initiator: mongoose.Types.ObjectId(id) }, { receiver: mongoose.Types.ObjectId(id) }]

  if (search) match.fullName = getRegex(search)

  return { skip: Number(skip), limit: Number(limit), match, sort: JSON.parse(sort) }
}

module.exports = coopsAggregateOptions
