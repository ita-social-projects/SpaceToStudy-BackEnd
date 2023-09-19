const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const resourceCategoryController = require('~/controllers/resourceCategory')
const resourceCategory = require('~/models/resourcesCategory')

const params = [{ model: resourceCategory, idName: 'id' }]

router.use(authMiddleware)

router.delete('/:id', isEntityValid({ params }), asyncWrapper(resourceCategoryController.deleteResourceCategory))

module.exports = router
