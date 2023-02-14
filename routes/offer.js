const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const offerController = require('~/controllers/offer')
const { authMiddleware } = require('~/middlewares/auth')
const setCurrentUserId = require('~/middlewares/setCurrentUserId')

const router = express.Router()

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/', asyncWrapper(offerController.getOffers))
router.post('/', setCurrentUserId, asyncWrapper(offerController.createOffer))
router.get('/:id', asyncWrapper(offerController.getOfferById))
router.patch('/:id', asyncWrapper(offerController.updateOffer))
router.delete('/:id', asyncWrapper(offerController.deleteOffer))

module.exports = router
