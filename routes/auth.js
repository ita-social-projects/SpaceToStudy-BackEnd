const express = require('express')

const asyncWrapper = require('~/middlewares/asyncWrapper')
const authController = require('~/controllers/auth')
const validationMiddleware = require('~/middlewares/validation')
const signupValidationSchema = require('~/validation/schemas/signup')

const router = express.Router()

router.post('/signup', validationMiddleware(signupValidationSchema), asyncWrapper(authController.signup))
router.post('/login', asyncWrapper(authController.login))
router.post('/logout', asyncWrapper(authController.logout))
router.get('/activate/:link', asyncWrapper(authController.activate))
router.get('/refresh', asyncWrapper(authController.refresh))

module.exports = router
