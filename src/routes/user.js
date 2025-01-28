const router = require('express').Router()

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { restrictTo, authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')
const validationMiddleware = require('~/middlewares/validation')

const userController = require('~/controllers/user')
const cooperationRouter = require('~/routes/cooperation')
const offerRouter = require('~/routes/offer')
const User = require('~/models/user')
const {
  roles: { ADMIN }
} = require('~/consts/auth')
const getUserByIdValidationSchema = require('~/validation/schemas/users/getUserByIdValidationSchema')
const updateUserValidationSchema = require('~/validation/schemas/users/updateUserValidationSchema')
const requestDataSource = require('~/consts/requestDataSource')

const params = [{ model: User, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)
router.param('offerId', idValidation)

router.use('/:id/cooperations', isEntityValid({ params }), cooperationRouter)
router.use('/:id/offers', isEntityValid({ params }), offerRouter)

router.get(
  '/:id',
  isEntityValid({ params }),
  validationMiddleware(getUserByIdValidationSchema, requestDataSource.QUERY),
  asyncWrapper(userController.getUserById)
)
router.get('/:id/bookmarks/offers', isEntityValid({ params }), asyncWrapper(userController.getBookmarkedOffers))
router.patch(
  '/:id',
  isEntityValid({ params }),
  validationMiddleware(updateUserValidationSchema),
  asyncWrapper(userController.updateUser)
)
router.patch('/deactivate/:id', isEntityValid({ params }), asyncWrapper(userController.deactivateUser))
router.patch('/activate/:id', isEntityValid({ params }), asyncWrapper(userController.activateUser))
router.patch(
  '/:id/bookmarks/offers/:offerId',
  isEntityValid({ params }),
  asyncWrapper(userController.toggleOfferBookmark)
)

router.use(restrictTo(ADMIN))
router.get('/', asyncWrapper(userController.getUsers))
router.patch('/:id/change-status', isEntityValid({ params }), asyncWrapper(userController.updateStatus))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(userController.blockUser))

module.exports = router
