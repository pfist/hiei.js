// Sort array of objects by key in descending order
export function sortByKey (arr, key) {
  return arr.sort((a, b) => (a[key] > b[key]) ? 1 : ((a[key] < b[key]) ? -1 : 0))
}
