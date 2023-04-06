const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { restrictTo, authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const User = require('~/models/user')
const userController = require('~/controllers/user')
const reviewRouter = require('~/routes/review')
const {
  roles: { ADMIN }
} = require('~/consts/auth')

const router = express.Router()

router.use(authMiddleware)

router.param('id', idValidation)

router.use('/:id/reviews', isEntityValid([{ model: User, idName: 'id' }]), reviewRouter)

router.get('/', asyncWrapper(userController.getUsers))
router.get('/:id', isEntityValid([{ model: User, idName: 'id' }]), asyncWrapper(userController.getUserById))

router.use(restrictTo(ADMIN))

router.patch('/:id', isEntityValid([{ model: User, idName: 'id' }]), asyncWrapper(userController.updateUser))
router.delete('/:id', isEntityValid([{ model: User, idName: 'id' }]), asyncWrapper(userController.deleteUser))

module.exports = router
