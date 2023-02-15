const express = require('express')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const locationController = require('~/controllers/location')

const router = express.Router()

router.get('/countries', asyncWrapper(locationController.getCountries))
router.get('/cities/:country', asyncWrapper(locationController.getCities))

module.exports = router
