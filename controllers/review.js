const reviewService = require('~/services/review')
const getMatchOptions = require('~/utils/getMatchOptions')

const getReviews = async (req, res) => {
  const { id: targetUserId } = req.params
  const { role: targetUserRole, rating, skip, limit } = req.query

  const match = getMatchOptions({ targetUserId, targetUserRole, rating })

  const reviews = await reviewService.getReviews(match, parseInt(skip), parseInt(limit))

  res.status(200).json(reviews)
}

const getReviewStatsByUserId = async (req, res) => {
  const { id } = req.params
  const { role } = req.query

  const reviewStats = await reviewService.getReviewStatsByUserId(id, role)

  res.status(200).json(reviewStats)
}

const getReviewById = async (req, res) => {
  const { id } = req.params

  const review = await reviewService.getReviewById(id)

  res.status(200).json(review)
}

const addReview = async (req, res) => {
  const { id: author } = req.user
  const data = req.body

  const newReview = await reviewService.addReview(author, data)

  res.status(201).json(newReview)
}

const updateReview = async (req, res) => {
  const { id } = req.params
  const updateData = req.body
  const { id: currentUserId } = req.user

  await reviewService.updateReview(id, currentUserId, updateData)

  res.status(204).end()
}

const deleteReview = async (req, res) => {
  const { id } = req.params

  await reviewService.deleteReview(id)

  res.status(204).end()
}

module.exports = {
  getReviews,
  getReviewStatsByUserId,
  getReviewById,
  addReview,
  updateReview,
  deleteReview
}
