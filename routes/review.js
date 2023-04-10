const router = require('express').Router({ mergeParams: true })

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const reviewController = require('~/controllers/review')
const User = require('~/models/user')
const Offer = require('~/models/offer')
const Review = require('~/models/review')

const body = [
  { model: User, idName: 'targetUserId' },
  { model: Offer, idName: 'offer' }
]
const param = [{ model: Review, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/stats', asyncWrapper(reviewController.getReviewStatsByUserId))

router.get('/', asyncWrapper(reviewController.getReviews))
router.post('/', isEntityValid(body, 'body'), asyncWrapper(reviewController.addReview))
router.get('/:id', isEntityValid(param), asyncWrapper(reviewController.getReviewById))
router.patch('/:id', isEntityValid(param), asyncWrapper(reviewController.updateReview))
router.delete('/:id', isEntityValid(param), asyncWrapper(reviewController.deleteReview))

module.exports = router
