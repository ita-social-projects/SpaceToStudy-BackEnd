const reviewService = require('~/services/review')

const getReviews = async (req, res) => {
  const { id: targetUserId, role: targetUserRole } = req.params

  const reviews = await reviewService.getReviews(targetUserId, targetUserRole)

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
