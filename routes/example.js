const express = require('express')

const asyncWrapper = require('~/middlewares/asyncWrapper')
const exampleController = require('~/controllers/example')

const router = express.Router()

router.get('/', asyncWrapper(exampleController.getExample))

router.post('/', asyncWrapper(exampleController.postExample))

module.exports = router
