const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const validationMiddleware = require('~/middlewares/validation')
const isEntityValid = require('~/middlewares/entityValidation')
const langMiddleware = require('~/middlewares/appLanguage')
const { authMiddleware } = require('~/middlewares/auth')

const authController = require('~/controllers/auth')
const signupValidationSchema = require('~/validation/schemas/signup')
const { loginValidationSchema, googleAuthValidationSchema } = require('~/validation/schemas/login')
const resetPasswordValidationSchema = require('~/validation/schemas/resetPassword')
const forgotPasswordValidationSchema = require('~/validation/schemas/forgotPassword')
const changePasswordValidationSchema = require('~/validation/schemas/changePassword')

const User = require('~/models/user')

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

const params = [{ model: User, idName: 'id' }]

router.patch(
  '/change-password/:id',
  isEntityValid({ params }),
  validationMiddleware(changePasswordValidationSchema),
  authMiddleware,
  langMiddleware,
  asyncWrapper(authController.changePassword)
)

module.exports = router
