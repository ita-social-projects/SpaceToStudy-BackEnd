const express = require('express')

const { authMiddleware } = require('~/middlewares/auth')
const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const categoryController = require('~/controllers/category')
const subjectRouter = require('~/routes/subject')

const router = express.Router()

router.use(authMiddleware)

router.param('id', idValidation)

router.use('/:id/subjects', subjectRouter)

router.get('/', asyncWrapper(categoryController.getCategories))
router.get('/:id', asyncWrapper(categoryController.getCategoryById))

//TODO: must be done after offers and cooperations logic
//router.post('/', asyncWrapper(categoryController.addCategory))
//router.patch('/:id', asyncWrapper(categoryController.updateCategory))
//router.delete('/:id', asyncWrapper(categoryController.deleteCategory))

module.exports = router
