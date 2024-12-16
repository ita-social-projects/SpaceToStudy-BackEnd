const { createError } = require('~/utils/errorsHelper')
const { READ_ONLY_ERROR } = require('~/consts/errors')

const restrictOperations = (operations, model) => {
  operations.forEach((operation) => {
    model[operation] = async function () {
      throw createError(403, READ_ONLY_ERROR)
    }
  })
}

const expectError = (statusCode, error, response) => {
  expect(response.body).toEqual({
    ...error,
    status: statusCode
  })
}

module.exports = { expectError, restrictOperations }
