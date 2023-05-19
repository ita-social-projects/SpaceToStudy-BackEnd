const getRegex = require("../getRegex")

const cooperationAggregateOptions = (query, params) => {
    const {
        skip = 0,
        limit = 5,
        sort = '{}',
        status = 'all'
    } = query

    const sortOptions = {}
    const match = {}

    if (status === 'all') {
        match.status = getRegex()
    } else {
        match.status = getRegex(status)
    }

    if (!sort.order) {
        sortOptions.order = 'updatedAt'
        sortOptions.orderBy = 'asc'
    } else {
        sortOptions[order] = orderBy
    }
        
        
    return { skip, limit, match, sortOptions }
}

module.exports = cooperationAggregateOptions