const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const setCurrentUserIdAndRole = require('~/middlewares/setCurrentUserIdAndRole')
const isEntityValid = require('~/middlewares/entityValidation')

const reviewController = require('~/controllers/review')
const Review = require('~/models/review')

const router = express.Router({ mergeParams: true })

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/', asyncWrapper(reviewController.getReviews))
router.post('/', setCurrentUserIdAndRole, asyncWrapper(reviewController.addReview))
router.get('/:id', isEntityValid([{ model: Review, idName: 'id' }]), asyncWrapper(reviewController.getReviewById))
router.patch('/:id', isEntityValid([{ model: Review, idName: 'id' }]), asyncWrapper(reviewController.updateReview))
router.delete('/:id', isEntityValid([{ model: Review, idName: 'id' }]), asyncWrapper(reviewController.deleteReview))

module.exports = router
