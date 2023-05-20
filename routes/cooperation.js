const router = require('express').Router()

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const cooperationController = require('~/controllers/cooperation')
const Offer = require('~/models/offer')
const Cooperation = require('~/models/cooperation')

const body = [{ model: Offer, idName: 'offerId' }]
const param = [{ model: Cooperation, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/', asyncWrapper(cooperationController.getCooperations))
router.post('/', isEntityValid(body, 'body'), asyncWrapper(cooperationController.createCooperation))
router.get('/:id', isEntityValid(param), asyncWrapper(cooperationController.getCooperationById))
router.patch('/:id', isEntityValid(param), asyncWrapper(cooperationController.updateCooperation))

module.exports = router
