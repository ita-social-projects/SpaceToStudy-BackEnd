const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/middlewares/auth')
const resourcesCategoryController = require('~/controllers/resourcesCategory')

const {
  roles: { TUTOR }
} = require('~/consts/auth')

router.use(authMiddleware)
router.use(restrictTo(TUTOR))
router.get('/', asyncWrapper(resourcesCategoryController.getResourcesCategories))
router.get('/names', asyncWrapper(resourcesCategoryController.getResourcesCategoriesNames))
router.post('/', asyncWrapper(resourcesCategoryController.createResourcesCategory))
router.patch('/:id', asyncWrapper(resourcesCategoryController.updateResourceCategory))

module.exports = router
