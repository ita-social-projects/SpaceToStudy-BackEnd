const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const langMiddleware = require('~/middlewares/appLanguage')

const emailController = require('~/controllers/email')

router.post('/', langMiddleware, asyncWrapper(emailController.sendEmail))

module.exports = router
