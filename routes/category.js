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
  enums: { PARAMS_ENUM }
} = require('~/consts/validation')

const nestedParams = [
  { model: Category, idName: 'categoryId' },
  { model: Subject, idName: 'subjectId' }
]
const params = [{ model: Category, idName: 'id' }]

router.use(authMiddleware)

PARAMS_ENUM.forEach((param) => {
  router.param(param, idValidation)
})

router.get(
  '/:categoryId?/subjects/:subjectId?/price-range',
  isEntityValid({ params:nestedParams}),
  asyncWrapper(categoryController.priceMinMax)
)
router.use('/:categoryId?/subjects/:subjectId?/offers', isEntityValid({ params:nestedParams }), offerRouter)
router.use('/:id?/subjects', isEntityValid({ params }), subjectRouter)
router.get('/', asyncWrapper(categoryController.getCategories))
router.post('/', asyncWrapper(categoryController.addCategory))
router.get('/names', asyncWrapper(categoryController.getCategoriesNames))
router.get('/:id', isEntityValid({ params }), asyncWrapper(categoryController.getCategoryById))

module.exports = router
