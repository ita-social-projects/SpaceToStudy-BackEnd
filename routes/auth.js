const express = require('express')

const asyncWrapper = require('~/middlewares/asyncWrapper')
const authController = require('~/controllers/auth')

const router = express.Router()

router.post('/signup', asyncWrapper(authController.signup))
router.post('/login', asyncWrapper(authController.login))
router.post('/logout', asyncWrapper(authController.logout))
router.get('/activate/:link', asyncWrapper(authController.activate))
router.get('/refresh', asyncWrapper(authController.refresh))

module.exports = router
