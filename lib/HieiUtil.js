import { promises as fs } from 'node:fs'
import path from 'node:path'

// Get an array of JS files found in a directory recursively
export async function getFiles (directory) {
  const all = await fs.readdir(directory)
  const files = await Promise.all(all.map(async (file) => {
    const filepath = path.join(directory, file)
    const stats = await fs.stat(filepath)

    if (stats.isDirectory()) {
      return getFiles(filepath)
    } else {
      return filepath
    }
  }))

  return files.filter(file => file.length).flat()
}

// Sort array of objects by key in descending order
export function sortByKey (arr, key) {
  return arr.sort((a, b) => (a[key] > b[key]) ? 1 : ((a[key] < b[key]) ? -1 : 0))
}
