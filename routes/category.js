const express = require('express')

const { authMiddleware } = require('~/middlewares/auth')
const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const isEntityValid = require('~/middlewares/entityValidation')

const categoryController = require('~/controllers/category')
const subjectRouter = require('~/routes/subject')
const offerRouter = require('~/routes/offer')
const {
  enums: { PARAMS }
} = require('~/consts/validation')

const Category = require('~/models/category')
const Subject = require('~/models/subject')

const router = express.Router()

router.use(authMiddleware)

PARAMS.forEach((param) => {
  router.param(param, idValidation)
})

router.get('/:categoryId?/subject/:subjectId?/price-range', asyncWrapper(categoryController.priceMinMax))
router.use(
  '/:categoryId?/subjects/:subjectId?/offers',
  isEntityValid([
    { model: Category, idName: 'categoryId' },
    { model: Subject, idName: 'subjectId' }
  ]),
  offerRouter
)
router.use('/:id?/subjects', isEntityValid([{ model: Category, idName: 'id' }]), subjectRouter)
router.get('/', asyncWrapper(categoryController.getCategories))
router.get('/names', asyncWrapper(categoryController.getCategoriesNames))
router.get('/:id', isEntityValid([{ model: Category, idName: 'id' }]), asyncWrapper(categoryController.getCategoryById))
router.get('/:id', asyncWrapper(categoryController.getCategoryById))

//TODO: must be done after offers and cooperations logic
//router.post('/', asyncWrapper(categoryController.addCategory))
//router.patch('/:id', asyncWrapper(categoryController.updateCategory))
//router.delete('/:id', asyncWrapper(categoryController.deleteCategory))

module.exports = router
