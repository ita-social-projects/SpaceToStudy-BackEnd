const router = require('express').Router()

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { restrictTo, authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const userController = require('~/controllers/user')
const reviewRouter = require('~/routes/review')
const cooperationRouter = require('~/routes/cooperation')
const offerRouter = require('~/routes/offer')
const User = require('~/models/user')
const {
  roles: { ADMIN }
} = require('~/consts/auth')

const params = [{ model: User, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)
router.param('offerId', idValidation)

router.use('/:id/reviews', isEntityValid({ params }), reviewRouter)
router.use('/:id/cooperations', isEntityValid({ params }), cooperationRouter)
router.use('/:id/offers', isEntityValid({ params }), offerRouter)

router.get('/', asyncWrapper(userController.getUsers))
router.get('/:id', isEntityValid({ params }), asyncWrapper(userController.getUserById))
router.get('/:id/bookmarks/offers', isEntityValid({ params }), asyncWrapper(userController.getBookmarkedOffers))
router.patch('/:id', isEntityValid({ params }), asyncWrapper(userController.updateUser))
router.patch('/deactivate/:id', isEntityValid({ params }), asyncWrapper(userController.deactivateUser))
router.patch('/activate/:id', isEntityValid({ params }), asyncWrapper(userController.activateUser))
router.patch(
  '/:id/bookmarks/offers/:offerId',
  isEntityValid({ params }),
  asyncWrapper(userController.toggleOfferBookmark)
)

router.use(restrictTo(ADMIN))
router.patch('/:id/change-status', isEntityValid({ params }), asyncWrapper(userController.updateStatus))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(userController.deleteUser))

module.exports = router
