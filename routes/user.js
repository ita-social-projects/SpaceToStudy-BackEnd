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

router.use('/:id/:role/reviews', reviewRouter)

router.get('/', asyncWrapper(userController.getUsers))
router.get('/:id/:role', asyncWrapper(userController.getOneUser))
router.get('/my-profile', setCurrentUserIdAndRole, asyncWrapper(userController.getOneUser))
router.delete('/:id', asyncWrapper(userController.deleteUser))

module.exports = router
