const getCategoriesOptions = (categories) => {
  if (categories) {
    const filtredItems = categories.map((item) => (item === 'null' ? null : item))

    return filtredItems
  } else {
    return
  }
}
module.exports = getCategoriesOptions
