const router = require('express').Router()

const { authMiddleware } = require('~/middlewares/auth')
const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const isEntityValid = require('~/middlewares/entityValidation')

const categoryController = require('~/controllers/category')
const subjectRouter = require('~/routes/subject')
const offerRouter = require('~/routes/offer')
const Category = require('~/models/category')
const Subject = require('~/models/subject')
const {
  enums: { PARAMS }
} = require('~/consts/validation')

const nestedParam = [
  { model: Category, idName: 'categoryId' },
  { model: Subject, idName: 'subjectId' }
]
const param = [{ model: Category, idName: 'id' }]

router.use(authMiddleware)

PARAMS.forEach((param) => {
  router.param(param, idValidation)
})

router.get(
  '/:categoryId?/subject/:subjectId?/price-range',
  isEntityValid(nestedParam),
  asyncWrapper(categoryController.priceMinMax)
)
router.use('/:categoryId?/subjects/:subjectId?/offers', isEntityValid(nestedParam), offerRouter)
router.use('/:id?/subjects', isEntityValid(param), subjectRouter)
router.get('/', asyncWrapper(categoryController.getCategories))
router.get('/names', asyncWrapper(categoryController.getCategoriesNames))
router.get('/:id', isEntityValid(param), asyncWrapper(categoryController.getCategoryById))

module.exports = router
