const testUserAuthentication = require('~/utils/testUserAuth')
const TokenService = require('~/services/token')
const checkCategoryExistence = require('~/seed/checkCategoryExistence')
const Category = require('~/models/category')

const createUser = async (app, testUser = {}) => {
  const accessToken = await testUserAuthentication(app, testUser)
  const decodedToken = TokenService.validateAccessToken(accessToken)
  const userId = decodedToken.id
  return { accessToken, userId }
}

const getCategory = async () => {
  await checkCategoryExistence()
  const categoryResponse = await Category.find()
  const category = categoryResponse[0]
  return category
}

module.exports = { createUser, getCategory }
