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

const param = [{ model: User, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)

router.use('/:id/reviews', isEntityValid(param), reviewRouter)
router.use('/:id/cooperations', isEntityValid(param), cooperationRouter)
router.use('/:id/offers', isEntityValid(param), offerRouter)

router.get('/', asyncWrapper(userController.getUsers))
router.get('/:id', isEntityValid(param), asyncWrapper(userController.getUserById))
router.patch('/:id', isEntityValid(param), asyncWrapper(userController.updateUser))

router.use(restrictTo(ADMIN))
router.patch('/:id/change-status', isEntityValid(param), asyncWrapper(userController.updateStatus))
router.delete('/:id', isEntityValid(param), asyncWrapper(userController.deleteUser))

module.exports = router
