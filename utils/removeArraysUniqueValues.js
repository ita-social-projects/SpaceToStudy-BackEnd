const removeArraysUniqueValues = (firstArray, secondArray) => {
  const filteredArray = firstArray.filter((item) => !secondArray.includes(item))

  return filteredArray
}

module.exports = removeArraysUniqueValues
