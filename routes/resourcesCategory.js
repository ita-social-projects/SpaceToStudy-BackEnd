const router = require('express').Router()

const ResourceCategory = require('~/models/resourcesCategory')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')
const resourcesCategoryController = require('~/controllers/resourcesCategory')

const {
  roles: { TUTOR }
} = require('~/consts/auth')

const params = [{ model: ResourceCategory, idName: 'id' }]

router.use(authMiddleware)
router.use(restrictTo(TUTOR))
router.get('/', asyncWrapper(resourcesCategoryController.getResourcesCategories))
router.get('/names', asyncWrapper(resourcesCategoryController.getResourcesCategoriesNames))
router.post('/', asyncWrapper(resourcesCategoryController.createResourcesCategory))
router.patch('/:id', isEntityValid({ params }), asyncWrapper(resourcesCategoryController.updateResourceCategory))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(resourcesCategoryController.deleteResourceCategory))

module.exports = router
