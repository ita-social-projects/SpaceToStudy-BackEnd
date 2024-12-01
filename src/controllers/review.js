const reviewService = require('~/services/review')
const getMatchOptions = require('~/utils/getMatchOptions')
const checkIdValidity = require('~/utils/checkIdValidity')

const getReviews = async (req, res) => {
  const { user: targetUserId, role: targetUserRole, rating, skip, limit } = req.query

  if (targetUserId) {
    checkIdValidity(targetUserId)
  }

  const match = getMatchOptions({ targetUserId, targetUserRole, rating })

  const reviews = await reviewService.getReviews(match, skip, limit)

  res.status(200).json(reviews)
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
  const { id: currentUserId } = req.user

  await reviewService.deleteReview(id, currentUserId)

  res.status(204).end()
}

module.exports = {
  getReviews,
  getReviewById,
  addReview,
  updateReview,
  deleteReview
}
