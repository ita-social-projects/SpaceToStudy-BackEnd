const getAdminsFilter = (query) => ({
  name: query.name,
  email: query.email,
  active: Boolean(parseInt(query.active)),
  blocked: Boolean(parseInt(query.blocked)),
  createdAtFrom: new Date(query.createdAtFrom),
  createdAtTo: new Date(query.createdAtTo),
  lastLoginFrom: new Date(query.lastLoginFrom),
  lastLoginTo: new Date(query.lastLoginTo)
})

const getAdminsSort = (query) => ({
  sortByName: parseInt(query.sortByName),
  sortByEmail: parseInt(query.sortByEmail),
  sortByCreatedAt: parseInt(query.sortByCreatedAt),
  sortByLastLogin: parseInt(query.sortByLastLogin)
})

module.exports = {
  getAdminsFilter,
  getAdminsSort
}
