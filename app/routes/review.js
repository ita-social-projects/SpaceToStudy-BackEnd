const router = require('express').Router({ mergeParams: true })

const idValidation = require('~/app/middlewares/idValidation')
const asyncWrapper = require('~/app/middlewares/asyncWrapper')
const { authMiddleware } = require('~/app/middlewares/auth')
const isEntityValid = require('~/app/middlewares/entityValidation')

const reviewController = require('~/app/controllers/review')
const User = require('~/app/models/user')
const Offer = require('~/app/models/offer')
const Review = require('~/app/models/review')

const body = [
  { model: User, idName: 'targetUserId' },
  { model: Offer, idName: 'offer' }
]
const params = [{ model: Review, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/stats', asyncWrapper(reviewController.getReviewStatsByUserId))

router.get('/', asyncWrapper(reviewController.getReviews))
router.post('/', isEntityValid({ body }), asyncWrapper(reviewController.addReview))
router.get('/:id', isEntityValid({ params }), asyncWrapper(reviewController.getReviewById))
router.patch('/:id', isEntityValid({ params }), asyncWrapper(reviewController.updateReview))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(reviewController.deleteReview))

module.exports = router
