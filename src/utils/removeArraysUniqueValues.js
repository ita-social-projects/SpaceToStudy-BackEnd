const removeArraysUniqueValues = (firstArray, secondArray) => firstArray.filter((item) => !secondArray.includes(item))

module.exports = removeArraysUniqueValues
