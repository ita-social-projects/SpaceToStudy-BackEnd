const { CronJob } = require('cron')
const categoryService = require('~/services/category')
const subjectService = require('~/services/subject')

const EVERY_SUNDAY_MIDNIGHT = '0 0 * * 0'
const UTC_TIME_ZONE = 'UTC'

const recountTotalOffers = async () => {
  await categoryService.recountTotalOffers()
  await subjectService.recountTotalOffers()
}

const updateTotalOffers = new CronJob(EVERY_SUNDAY_MIDNIGHT, recountTotalOffers, null, false, UTC_TIME_ZONE)

module.exports = { updateTotalOffers, recountTotalOffers }
