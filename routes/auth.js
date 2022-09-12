const express = require('express')

const asyncWrapper = require('~/middlewares/asyncWrapper')
const authController = require('~/controllers/auth')
const validationMiddleware = require('~/middlewares/validation')
const signupValidationSchema = require('~/validation/schemas/signup')
const loginValidationSchema = require('~/validation/schemas/login')
const resetPasswordValidationSchema = require('~/validation/schemas/resetPassword')
const forgotPasswordValidationSchema = require('~/validation/schemas/forgotPassword')
const langMiddleware = require('~/middlewares/language')

const router = express.Router()

router.post(
  '/signup',
  validationMiddleware(signupValidationSchema),
  langMiddleware,
  asyncWrapper(authController.signup)
)
router.post('/login', validationMiddleware(loginValidationSchema), asyncWrapper(authController.login))
router.post('/logout', asyncWrapper(authController.logout))
router.get('/confirm-email/:token', asyncWrapper(authController.confirmEmail))
router.get('/refresh', asyncWrapper(authController.refreshAccessToken))
router.post(
  '/forgot-password',
  validationMiddleware(forgotPasswordValidationSchema),
  langMiddleware,
  asyncWrapper(authController.sendResetPasswordEmail)
)
router.patch(
  '/reset-password/:token',
  validationMiddleware(resetPasswordValidationSchema),
  langMiddleware,
  asyncWrapper(authController.updatePassword)
)

module.exports = router
