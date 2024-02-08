const router = require('express').Router()

const asyncWrapper = require('~/app/middlewares/asyncWrapper')
const langMiddleware = require('~/app/middlewares/appLanguage')

const emailController = require('~/app/controllers/email')

router.post('/', langMiddleware, asyncWrapper(emailController.sendEmail))

module.exports = router
