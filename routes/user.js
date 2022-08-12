const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const userController = require('~/controllers/user')

const router = express.Router()

router.param('userId', idValidation)

router.get('/', asyncWrapper(userController.getUsers))
router.get('/:userId', asyncWrapper(userController.getUser))
router.delete('/:userId', asyncWrapper(userController.deleteUser))

module.exports = router
