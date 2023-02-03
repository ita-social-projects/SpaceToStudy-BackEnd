const express = require('express')

const asyncWrapper = require('~/middlewares/asyncWrapper')
const emailController = require('~/controllers/email')
const langMiddleware = require('~/middlewares/appLanguage')

const router = express.Router()

router.post('/', langMiddleware, asyncWrapper(emailController.sendEmail))

module.exports = router
