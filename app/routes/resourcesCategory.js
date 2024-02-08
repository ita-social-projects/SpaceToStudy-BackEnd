const router = require('express').Router()

const ResourceCategory = require('~/app/models/resourcesCategory')
const asyncWrapper = require('~/app/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/app/middlewares/auth')
const isEntityValid = require('~/app/middlewares/entityValidation')
const resourcesCategoryController = require('~/app/controllers/resourcesCategory')

const {
  roles: { TUTOR }
} = require('~/app/consts/auth')

const params = [{ model: ResourceCategory, idName: 'id' }]

router.use(authMiddleware)
router.use(restrictTo(TUTOR))
router.get('/', asyncWrapper(resourcesCategoryController.getResourcesCategories))
router.get('/names', asyncWrapper(resourcesCategoryController.getResourcesCategoriesNames))
router.post('/', asyncWrapper(resourcesCategoryController.createResourcesCategory))
router.patch('/:id', isEntityValid({ params }), asyncWrapper(resourcesCategoryController.updateResourceCategory))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(resourcesCategoryController.deleteResourceCategory))

module.exports = router
