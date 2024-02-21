const getCategoriesOptions = (categories) => {
  if (categories) {
    return categories.map((item) => (item === 'null' ? null : item))
  } else {
    return
  }
}
module.exports = getCategoriesOptions
