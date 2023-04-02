const router = require('express').Router({ mergeParams: true })

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const offerController = require('~/controllers/offer')
const Offer = require('~/models/offer')
const Category = require('~/models/category')
const Subject = require('~/models/subject')

const body = [
  { model: Category, idName: 'categoryId' },
  { model: Subject, idName: 'subjectId' }
]
const param = [{ model: Offer, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/', asyncWrapper(offerController.getOffers))
router.post('/', isEntityValid(body, 'body'), asyncWrapper(offerController.createOffer))
router.get('/:id', isEntityValid(param), asyncWrapper(offerController.getOfferById))
router.patch('/:id', isEntityValid(param), asyncWrapper(offerController.updateOffer))
router.delete('/:id', isEntityValid(param), asyncWrapper(offerController.deleteOffer))

module.exports = router
