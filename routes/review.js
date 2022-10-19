const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const reviewController = require('~/controllers/review')

const router = express.Router()

router.param('reviewId', idValidation)

router.get('/', asyncWrapper(reviewController.getReviews))
router.post('/', asyncWrapper(reviewController.addReview))
router.get('/:reviewId', asyncWrapper(reviewController.getReviewById))
router.patch('/:reviewId', asyncWrapper(reviewController.updateReview))
router.delete('/:reviewId', asyncWrapper(reviewController.deleteReview))

module.exports = router
