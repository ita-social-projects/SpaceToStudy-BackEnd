const express = require('express')

const idValidation = require('~/middlewares/idValidation')

const router = express.Router()

router.param('reviewId', idValidation)

router.get('/')
router.post('/')
router.get('/:reviewId')
router.patch('/:reviewId')
router.delete('/:reviewId')

module.exports = router
