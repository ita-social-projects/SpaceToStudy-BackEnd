const offerService = require('~/services/offer')
const offerAggregateOptions = require('~/utils/offers/offerAggregateOptions')
const getMatchOptions = require('~/utils/getMatchOptions')

const getOffers = async (req, res) => {
  const { match, sort, skip, limit } = offerAggregateOptions(req.query, req.params)

  const offers = await offerService.getOffers(match, sort, parseInt(skip), parseInt(limit))

  res.status(200).json(offers)
}

const getOfferById = async (req, res) => {
  const { id } = req.params

  const offer = await offerService.getOfferById(id)

  res.status(200).json(offer)
}

const createOffer = async (req, res) => {
  const { id: authorId, role: authorRole } = req.user
  const offer = req.body

  const newOffer = await offerService.createOffer(authorId, authorRole, offer)

  res.status(201).json(newOffer)
}

const updateOffer = async (req, res) => {
  const { id } = req.params
  const { price, proficiencyLevel, description, languages } = req.body

  const filteredFields = getMatchOptions({ price, proficiencyLevel, description, languages })

  await offerService.updateOffer(id, filteredFields)

  res.status(204).end()
}

const deleteOffer = async (req, res) => {
  const { id } = req.params

  await offerService.deleteOffer(id)

  res.status(204).end()
}

module.exports = {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer
}
