const router = require('express').Router({ mergeParams: true })

const idValidation = require('~/app/middlewares/idValidation')
const asyncWrapper = require('~/app/middlewares/asyncWrapper')
const { authMiddleware } = require('~/app/middlewares/auth')
const isEntityValid = require('~/app/middlewares/entityValidation')

const noteRouter = require('~/app/routes/note')

const cooperationController = require('~/app/controllers/cooperation')
const Offer = require('~/app/models/offer')
const Cooperation = require('~/app/models/cooperation')

const body = [{ model: Offer, idName: 'offer' }]
const params = [{ model: Cooperation, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)

router.use('/:id/notes', noteRouter)

router.get('/', asyncWrapper(cooperationController.getCooperations))
router.post('/', isEntityValid({ body }), asyncWrapper(cooperationController.createCooperation))
router.get('/:id', isEntityValid({ params }), asyncWrapper(cooperationController.getCooperationById))
router.patch('/:id', isEntityValid({ params }), asyncWrapper(cooperationController.updateCooperation))

module.exports = router
