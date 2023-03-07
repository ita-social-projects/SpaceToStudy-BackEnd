const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const setCurrentUserIdAndRole = require('~/middlewares/setCurrentUserIdAndRole')
const { authMiddleware } = require('~/middlewares/auth')

const userController = require('~/controllers/user')
const reviewRouter = require('~/routes/review')

const router = express.Router()

router.use(authMiddleware)

router.param('id', idValidation)

router.use('/:id/reviews', reviewRouter)

router.get('/', asyncWrapper(userController.getUsers))
router.get('/:id', asyncWrapper(userController.getOneUser))
router.get('/my-profile', setCurrentUserIdAndRole, asyncWrapper(userController.getOneUser))

router.patch('/:id', asyncWrapper(userController.updateUser))
router.delete('/:id', asyncWrapper(userController.deleteUser))

module.exports = router
