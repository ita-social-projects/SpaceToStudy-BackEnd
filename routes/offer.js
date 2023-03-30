const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const setCurrentUserIdAndRole = require('~/middlewares/setCurrentUserIdAndRole')
const isEntityValid = require('~/middlewares/entityValidation')

const offerController = require('~/controllers/offer')
const Offer = require('~/models/offer')

const router = express.Router({ mergeParams: true })

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/', asyncWrapper(offerController.getOffers))
router.get('/price-range', asyncWrapper(offerController.priceMinMax))
router.post('/', setCurrentUserIdAndRole, asyncWrapper(offerController.createOffer))
router.get('/:id', isEntityValid([{ model: Offer, idName: 'id' }]), asyncWrapper(offerController.getOfferById))
router.patch('/:id', isEntityValid([{ model: Offer, idName: 'id' }]), asyncWrapper(offerController.updateOffer))
router.delete('/:id', isEntityValid([{ model: Offer, idName: 'id' }]), asyncWrapper(offerController.deleteOffer))

module.exports = router
