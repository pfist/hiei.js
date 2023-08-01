import { getFiles } from './src/utilities/file-util.js'
import { pathToFileURL } from 'node:url'

try {
  const files = await getFiles('test/src/interactions/slash-commands')
  for (const file of files) {
    const { default: Command } = await import(pathToFileURL(file))
    const instance = new Command()
    console.log(instance)
  }
} catch (err) {
  console.error(err)
}
