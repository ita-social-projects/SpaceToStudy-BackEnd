const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const userController = require('~/controllers/user')
const reviewRouter = require('~/routes/review')

const router = express.Router()

router.param('id', idValidation)

router.use('/:id/reviews', reviewRouter)

router.get('/', asyncWrapper(userController.getUsers))
router.get('/:id', asyncWrapper(userController.getUserById))
router.delete('/:id', asyncWrapper(userController.deleteUser))

module.exports = router
