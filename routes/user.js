const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const userController = require('~/controllers/user')

const router = express.Router()

router.param('userId', idValidation)

router.get('/', asyncWrapper(userController.getUsers))
router.get('/param/:param', asyncWrapper(userController.getUserByParam))
router.get('/id/:userId', asyncWrapper(userController.getUserById))
router.delete('/id/:userId', asyncWrapper(userController.deleteUser))

module.exports = router
