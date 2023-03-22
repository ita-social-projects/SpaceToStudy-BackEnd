const reviewService = require('~/services/review')
const getMatchOptions = require('~/utils/getMatchOptions')

const getReviews = async (req, res) => {
  const { id: targetUserId } = req.params
  const { role: targetUserRole, rating, skip, limit } = req.query

  const match = getMatchOptions({ targetUserId, targetUserRole, rating })

  const reviews = await reviewService.getReviews(match, parseInt(skip), parseInt(limit))

  res.status(200).json(reviews)
}

const getReviewById = async (req, res) => {
  const { id } = req.params

  const review = await reviewService.getReviewById(id)

  res.status(200).json(review)
}

const addReview = async (req, res) => {
  const { id: author } = req.params
  const { comment, rating, targetUserId, targetUserRole, offer } = req.body

  const newReview = await reviewService.addReview(comment, rating, author, targetUserId, targetUserRole, offer)

  res.status(201).json(newReview)
}

const updateReview = async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  await reviewService.updateReview(id, updateData)

  res.status(204).end()
}

const deleteReview = async (req, res) => {
  const { id } = req.params

  await reviewService.deleteReview(id)

  res.status(204).end()
}

module.exports = {
  getReviews,
  getReviewById,
  addReview,
  updateReview,
  deleteReview
}
