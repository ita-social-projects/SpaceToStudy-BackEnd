const express = require('express')

const idValidation = require('~/middlewares/idValidation')
// const asyncWrapper = require('~/middlewares/asyncWrapper')
// const userController = require('~/controllers/user')

const router = express.Router()

router.param('id', idValidation)

router.get('/')
router.get('/:id')
router.delete('/:id')

module.exports = router
