const express = require('express')

const asyncWrapper = require('~/middlewares/asyncWrapper')
const roleController = require('~/controllers/role')

const router = express.Router()

router.post('/', asyncWrapper(roleController.createRole))
router.get('/:value', asyncWrapper(roleController.getRoleByValue))

module.exports = router
