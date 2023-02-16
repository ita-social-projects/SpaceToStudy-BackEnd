const offerService = require('~/services/offer')

const getOffers = async (req, res) => {
  const offers = await offerService.getOffers()

  res.status(200).json(offers)
}

const getOfferById = async (req, res) => {
  const { id } = req.params

  const offer = await offerService.getOfferById(id)

  res.status(200).json(offer)
}

const createOffer = async (req, res) => {
  const userId = req.params.id
  const { price, proficiencyLevel, description, languages, userRole, subjectId, categoryId, isActive } = req.body

  const newOffer = await offerService.createOffer(
    price,
    proficiencyLevel,
    description,
    languages,
    userRole,
    userId,
    subjectId,
    categoryId,
    isActive
  )

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
