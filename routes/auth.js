const express = require('express')

const authController = require('~/controllers/auth')
const validationMiddleware = require('~/middlewares/validation')
const signupValidationSchema = require('~/validation/schemas/signup')

const router = express.Router()

router.post('/signup', validationMiddleware(signupValidationSchema), authController.signup)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.get('/activate/:link', authController.activate)
router.get('/refresh', authController.refresh)

module.exports = router
