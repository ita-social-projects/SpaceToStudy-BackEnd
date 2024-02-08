const router = require('express').Router()

const idValidation = require('~/app/middlewares/idValidation')
const asyncWrapper = require('~/app/middlewares/asyncWrapper')
const { restrictTo, authMiddleware } = require('~/app/middlewares/auth')
const isEntityValid = require('~/app/middlewares/entityValidation')

const userController = require('~/app/controllers/user')
const reviewRouter = require('~/app/routes/review')
const cooperationRouter = require('~/app/routes/cooperation')
const offerRouter = require('~/app/routes/offer')
const User = require('~/app/models/user')
const {
  roles: { ADMIN }
} = require('~/app/consts/auth')

const params = [{ model: User, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)

router.use('/:id/reviews', isEntityValid({ params }), reviewRouter)
router.use('/:id/cooperations', isEntityValid({ params }), cooperationRouter)
router.use('/:id/offers', isEntityValid({ params }), offerRouter)

router.get('/', asyncWrapper(userController.getUsers))
router.get('/:id', isEntityValid({ params }), asyncWrapper(userController.getUserById))
router.patch('/:id', isEntityValid({ params }), asyncWrapper(userController.updateUser))

router.use(restrictTo(ADMIN))
router.patch('/:id/change-status', isEntityValid({ params }), asyncWrapper(userController.updateStatus))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(userController.deleteUser))

module.exports = router
