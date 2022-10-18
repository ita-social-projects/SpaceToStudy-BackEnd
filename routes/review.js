const express = require('express')

const idValidation = require('~/middlewares/idValidation')

const router = express.Router()

router.param('reviewId', idValidation)

router.get('/')
router.get('/:reviewId')
router.post('/')
router.put('/:reviewId')
router.delete('/:reviewId')

module.exports = router
