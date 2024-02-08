const router = require('express').Router({ mergeParams: true })

const idValidation = require('~/app/middlewares/idValidation')
const asyncWrapper = require('~/app/middlewares/asyncWrapper')
const { authMiddleware } = require('~/app/middlewares/auth')
const isEntityValid = require('~/app/middlewares/entityValidation')

const offerController = require('~/app/controllers/offer')
const Offer = require('~/app/models/offer')
const Category = require('~/app/models/category')
const Subject = require('~/app/models/subject')

const body = [
  { model: Category, idName: 'categoryId' },
  { model: Subject, idName: 'subjectId' }
]
const params = [{ model: Offer, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/', asyncWrapper(offerController.getOffers))
router.post('/', isEntityValid({ body }), asyncWrapper(offerController.createOffer))
router.get('/:id', isEntityValid({ params }), asyncWrapper(offerController.getOfferById))
router.patch('/:id', isEntityValid({ params }), asyncWrapper(offerController.updateOffer))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(offerController.deleteOffer))

module.exports = router
