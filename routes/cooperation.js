const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const setCurrentUserIdAndRole = require('~/middlewares/setCurrentUserIdAndRole')
const isEntityValid = require('~/middlewares/entityValidation')

const cooperationController = require('~/controllers/cooperation')
const Cooperation = require('~/models/cooperation')

const router = express.Router()

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/', asyncWrapper(cooperationController.getCooperations))
router.post('/', setCurrentUserIdAndRole, asyncWrapper(cooperationController.createCooperation))
router.get(
  '/:id',
  isEntityValid([{ model: Cooperation, idName: 'id' }]),
  asyncWrapper(cooperationController.getCooperationById)
)
router.patch(
  '/:id',
  isEntityValid([{ model: Cooperation, idName: 'id' }]),
  asyncWrapper(cooperationController.updateCooperation)
)

module.exports = router
