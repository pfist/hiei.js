import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

/** Get an array of JS files found in a directory recursively.
 * @param {string} directory - The directory to get files from.
*/
export async function discoverFiles (dir) {
  const files = await readdir(dir, { recursive: true, withFileTypes: true })
  return files
    .filter(file => file.isFile() && file.name.endsWith('.js'))
    .map(file => join(file.path, file.name))
}
