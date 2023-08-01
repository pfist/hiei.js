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

  return validFiles.filter(file => file.length).flat().filter(file => file.endsWith('.js'))
}
