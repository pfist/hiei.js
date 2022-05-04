import { promises as fs } from 'node:fs'
import path from 'node:path'

/** Get an array of JS files found in a directory recursively.
 * @param {string} directory - The directory to get files from.
*/
export async function getFiles (directory) {
  const files = await fs.readdir(directory)
  const validFiles = await Promise.all(files.map(async (file) => {
    const filepath = path.join(directory, file)
    const stats = await fs.stat(filepath)

    if (stats.isDirectory()) {
      return getFiles(filepath)
    } else {
      return filepath
    }
  }))

  return validFiles.filter(file => file.length).flat()
}

/** Sort an array of objects by key in descending order.
 * @param {Array} arr - The array you want to sort.
 * @param {string} key - The key you want to sort by.
*/
export function sortByKey (arr, key) {
  return arr.sort((a, b) => (a[key] > b[key]) ? 1 : ((a[key] < b[key]) ? -1 : 0))
}
