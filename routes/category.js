const express = require('express')

const { authMiddleware } = require('~/middlewares/auth')
const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')

const categoryController = require('~/controllers/category')
const subjectRouter = require('~/routes/subject')
const offerRouter = require('~/routes/offer')

const router = express.Router()

router.use(authMiddleware)

router.param('id', idValidation)

router.use('/:id/subjects', subjectRouter)

router.use('/:catId?/subjects/:subId?/offers', offerRouter)

router.get('/', asyncWrapper(categoryController.getCategories))
router.get('/names', asyncWrapper(categoryController.getCategoriesNames))
router.get('/:id', asyncWrapper(categoryController.getCategoryById))

module.exports = router
