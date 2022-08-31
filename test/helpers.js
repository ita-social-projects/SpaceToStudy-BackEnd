const expectError = (statusCode, error, response) => {
  expect(response.body).toEqual({
    ...error,
    status: statusCode
  })
}

module.exports = { expectError }
