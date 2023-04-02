const offerService = require('~/services/offer')
const getMatchOptions = require('~/utils/getMatchOptions')

const getOffers = async (req, res) => {
  const { categoryId, subjectId } = req.params

  const match = getMatchOptions({ categoryId, subjectId })

  const offers = await offerService.getOffers(match)

  res.status(200).json(offers)
}

const getOfferById = async (req, res) => {
  const { id } = req.params

  const offer = await offerService.getOfferById(id)

  res.status(200).json(offer)
}

const createOffer = async (req, res) => {
  const { id: authorId } = req.params
  const { role: authorRole } = req.user

  const newOffer = await offerService.createOffer({
    authorRole,
    authorId,
    ...req.body
  })

  res.status(201).json(newOffer)
}

const updateOffer = async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  await offerService.updateOffer(id, updateData)

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
