const router = require('express').Router({ mergeParams: true })

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')
const validationMiddleware = require('~/middlewares/validation')

const { addReviewValidationSchema, updateReviewValidationSchema } = require('~/validation/schemas/review')
const reviewController = require('~/controllers/review')
const User = require('~/models/user')
const Offer = require('~/models/offer')
const Review = require('~/models/review')

const body = [
  { model: User, idName: 'targetUserId' },
  { model: Offer, idName: 'offer' }
]
const params = [{ model: Review, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/', asyncWrapper(reviewController.getReviews))
router.post(
  '/',
  isEntityValid({ body }),
  validationMiddleware(addReviewValidationSchema),
  asyncWrapper(reviewController.addReview)
)
router.get('/:id', isEntityValid({ params }), asyncWrapper(reviewController.getReviewById))
router.patch(
  '/:id',
  isEntityValid({ params }),
  validationMiddleware(updateReviewValidationSchema),
  asyncWrapper(reviewController.updateReview)
)
router.delete('/:id', isEntityValid({ params }), asyncWrapper(reviewController.deleteReview))

module.exports = router
