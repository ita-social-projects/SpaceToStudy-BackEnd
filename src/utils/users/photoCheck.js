const shouldDeletePreviousPhoto = (oldPhoto, newPhoto) => {
  return oldPhoto && (newPhoto || newPhoto === null)
}

module.exports = { shouldDeletePreviousPhoto }
