const router = require('express').Router()

const asyncWrapper = require('~/app/middlewares/asyncWrapper')
const validationMiddleware = require('~/app/middlewares/validation')
const langMiddleware = require('~/app/middlewares/appLanguage')

const authController = require('~/app/controllers/auth')
const signupValidationSchema = require('~/app/validation/schemas/signup')
const { loginValidationSchema, googleAuthValidationSchema } = require('~/app/validation/schemas/login')
const resetPasswordValidationSchema = require('~/app/validation/schemas/resetPassword')
const forgotPasswordValidationSchema = require('~/app/validation/schemas/forgotPassword')

router.post(
  '/signup',
  validationMiddleware(signupValidationSchema),
  langMiddleware,
  asyncWrapper(authController.signup)
)
router.post('/login', validationMiddleware(loginValidationSchema), asyncWrapper(authController.login))
router.post(
  '/google-auth',
  validationMiddleware(googleAuthValidationSchema),
  langMiddleware,
  asyncWrapper(authController.googleAuth)
)
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
