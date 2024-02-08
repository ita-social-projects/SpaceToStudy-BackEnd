const offerService = require('~/app/services/offer')
const offerAggregateOptions = require('~/app/utils/offers/offerAggregateOptions')

const getOffers = async (req, res) => {
  const pipeline = offerAggregateOptions(req.query, req.params, req.user)

  const offers = await offerService.getOffers(pipeline)

  res.status(200).json(offers)
}

const getOfferById = async (req, res) => {
  const { id } = req.params
  const { id: userId } = req.user

  const offer = await offerService.getOfferById(id, userId)

  res.status(200).json(offer)
}

const createOffer = async (req, res) => {
  const { id: authorId, role: authorRole } = req.user
  const data = req.body

  const newOffer = await offerService.createOffer(authorId, authorRole, data)

  res.status(201).json(newOffer)
}

const updateOffer = async (req, res) => {
  const { id } = req.params
  const updateData = req.body
  const { id: currentUserId } = req.user

  await offerService.updateOffer(id, currentUserId, updateData)

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
