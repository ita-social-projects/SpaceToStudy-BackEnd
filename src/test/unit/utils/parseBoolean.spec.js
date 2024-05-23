const parseBoolean = require('~/utils/parseBoolean')

describe('ParseBoolean util function for parsing boolean in search params', () => {
  it('should return true if string is true', () => {
    const result = parseBoolean('true')
    expect(result).toBe(true)
  })
  it('should return false if string is false', () => {
    const result = parseBoolean('false')
    expect(result).toBe(false)
  })
})
