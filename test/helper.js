const response = () => {
  const res = {
    statusCode: undefined,
    data: undefined,
    status: (code) => {
      res.statusCode = code
      return res
    },
    json: (data) => {
      res.data = data
    },
    restore: () => {
      res.statusCode = undefined
      res.data = undefined
    }
  }
  return res
}

module.exports = {
  response,
}
