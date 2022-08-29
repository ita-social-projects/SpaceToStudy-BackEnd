const express = require('express')

const asyncWrapper = require('~/middlewares/asyncWrapper')
const emailController = require('~/controllers/email')

const router = express.Router()

router.post('/', asyncWrapper(emailController.sendEmail))

module.exports = router
