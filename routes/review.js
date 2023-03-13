const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const reviewController = require('~/controllers/review')
const setCurrentUserIdAndRole = require('~/middlewares/setCurrentUserIdAndRole')

const router = express.Router({ mergeParams: true })

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/', asyncWrapper(reviewController.getReviews))
router.post('/', setCurrentUserIdAndRole, asyncWrapper(reviewController.addReview))
router.get('/:id', asyncWrapper(reviewController.getReviewById))
router.patch('/:id', asyncWrapper(reviewController.updateReview))
router.delete('/:id', asyncWrapper(reviewController.deleteReview))

module.exports = router
