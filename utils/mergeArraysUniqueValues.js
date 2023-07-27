const mergeArraysUniqueValues = (firstArray, secondArray) => {
  const uniqueValuesArray = secondArray.filter((item) => !firstArray.includes(item))

  const mergedArray = firstArray.concat(uniqueValuesArray)

  return mergedArray
}

module.exports = mergeArraysUniqueValues
