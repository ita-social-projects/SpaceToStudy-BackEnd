const router = require('express').Router({ mergeParams: true })

const commentController = require('~/controllers/comment')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const Cooperation = require('~/models/cooperation')

const params = [{ model: Cooperation, idName: 'id' }]

router.use(authMiddleware)

router.get('/', isEntityValid({ params }), asyncWrapper(commentController.getComments))
router.post('/', isEntityValid({ params }), asyncWrapper(commentController.addComment))

module.exports = router
