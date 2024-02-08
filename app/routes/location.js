const router = require('express').Router()

const asyncWrapper = require('~/app/middlewares/asyncWrapper')
const locationController = require('~/app/controllers/location')
const { authMiddleware } = require('~/app/middlewares/auth')

router.use(authMiddleware)

router.get('/countries', asyncWrapper(locationController.getCountries))
router.get('/cities/:country', asyncWrapper(locationController.getCities))

module.exports = router
