const router = require('express').Router({ mergeParams: true })

const commentController = require('~/controllers/comment')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const Cooperation = require('~/models/cooperation')
const User = require('~/models/user')

const body = [{model:Cooperation, idName: 'cooperation'}, { model:User, idName: 'author'}]
const params = [{ model:Cooperation, idName: 'id'}]

router.use(authMiddleware)

router.get('/', isEntityValid({ params }), asyncWrapper(commentController.getAll))
router.post('/', isEntityValid({ body, params }), asyncWrapper(commentController.create))

module.exports = router
