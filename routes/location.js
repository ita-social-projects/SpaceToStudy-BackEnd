const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')

const locationController = require('~/controllers/location')

router.get('/countries', asyncWrapper(locationController.getCountries))
router.get('/cities/:country', asyncWrapper(locationController.getCities))

module.exports = router
