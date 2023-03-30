const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const setCurrentUserIdAndRole = require('~/middlewares/setCurrentUserIdAndRole')
const { restrictTo, authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')
const {
  roles: { ADMIN }
} = require('~/consts/auth')

const User = require('~/models/user')
const userController = require('~/controllers/user')
const reviewRouter = require('~/routes/review')

const router = express.Router()

router.use(authMiddleware)

router.param('id', idValidation)

router.use('/:id/reviews', isEntityValid([{ model: User, idName: 'id' }]), reviewRouter)

router.get('/', asyncWrapper(userController.getUsers))
router.get('/:id', asyncWrapper(userController.getOneUser))
router.get('/my-profile', setCurrentUserIdAndRole, asyncWrapper(userController.getOneUser))

router.use(restrictTo(ADMIN))

router.patch('/:id', asyncWrapper(userController.updateUser))
router.delete('/:id', asyncWrapper(userController.deleteUser))

module.exports = router
