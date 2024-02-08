const router = require('express').Router()

const { authMiddleware } = require('~/app/middlewares/auth')
const idValidation = require('~/app/middlewares/idValidation')
const asyncWrapper = require('~/app/middlewares/asyncWrapper')
const isEntityValid = require('~/app/middlewares/entityValidation')

const categoryController = require('~/app/controllers/category')
const subjectRouter = require('~/app/routes/subject')
const offerRouter = require('~/app/routes/offer')
const Category = require('~/app/models/category')
const Subject = require('~/app/models/subject')
const {
  enums: { PARAMS_ENUM }
} = require('~/app/consts/validation')

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
  isEntityValid({ params: nestedParams }),
  asyncWrapper(categoryController.priceMinMax)
)
router.use('/:categoryId?/subjects/:subjectId?/offers', isEntityValid({ params: nestedParams }), offerRouter)
router.use('/:id?/subjects', isEntityValid({ params }), subjectRouter)
router.get('/', asyncWrapper(categoryController.getCategories))
router.post('/', asyncWrapper(categoryController.addCategory))
router.get('/names', asyncWrapper(categoryController.getCategoriesNames))
router.get('/:id', isEntityValid({ params }), asyncWrapper(categoryController.getCategoryById))

module.exports = router
